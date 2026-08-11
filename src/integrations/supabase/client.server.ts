import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://gxskutcwhatbkeaczyvd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_pvw14Jg_3BCrZFoUsmAH3Q_6P5GRnbY';

// Helper to create clients with consistent header configuration
export const createAdminClient = () => {
  return createClient<Database>(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      global: {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
      },
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
};

// Standard admin client instance
export const supabaseAdmin = createAdminClient();
