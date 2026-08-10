import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = 'https://gxskutcwhatbkeaczyvd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_pvw14Jg_3BCrZFoUsmAH3Q_6P5GRnbY';
const SUPABASE_ANON_KEY = SUPABASE_PUBLISHABLE_KEY;

export const requireSupabaseAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const request = getRequest();

    if (!request?.headers) {
      throw new Error('Unauthorized');
    }

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : undefined;
    
    const supabase = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
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