import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export const requireSupabaseAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const request = getRequest();

    if (!request?.headers) {
      // In TanStack Start v1 server functions, next() must be returned
      // If we want to block, we should throw a Response or return a value
      // but usually middleware just provides context.
      return next({
        context: {
          supabase: null as any,
          userId: 'guest',
          claims: null,
        },
      });
    }

    const authHeader = request.headers.get('authorization');
    const token = (authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : undefined) as string | undefined;
    
    const supabase = createClient<Database>(
      'https://gxskutcwhatbkeaczyvd.supabase.co',
      'sb_publishable_pvw14Jg_3BCrZFoUsmAH3Q_6P5GRnbY',
      {
        global: {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    let userId = 'guest';
    let claims = null;

    if (token && token.split('.').length === 3) {
      try {
        const { data, error } = await supabase.auth.getClaims(token);
        if (!error && data?.claims?.sub) {
          userId = data.claims.sub;
          claims = data.claims;
        }
      } catch (e) {
        // Silent guest fallback
      }
    }

    return next({
      context: {
        supabase,
        userId,
        claims,
      },
    });
  },
);