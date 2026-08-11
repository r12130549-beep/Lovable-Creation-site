import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

// HARDCODED keys to prevent "Invalid API Key" errors during server-side execution
const SUPABASE_URL = 'https://gxskutcwhatbkeaczyvd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pvw14Jg_3BCrZFoUsmAH3Q_6P5GRnbY';

export const requireSupabaseAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const request = getRequest();

    const authHeader = request?.headers?.get('authorization');
    const token = (authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : undefined) as string | undefined;
    
    const supabase: SupabaseClient<Database> = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': token ? `Bearer ${token}` : `Bearer ${SUPABASE_ANON_KEY}`,
          },
        },
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    let userId = 'guest';
    let claims: any = null;

    if (token && token.split('.').length === 3) {
      try {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data?.user) {
          userId = data.user.id;
          claims = data.user;
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