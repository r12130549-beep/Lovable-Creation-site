import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://gxskutcwhatbkeaczyvd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_pvw14Jg_3BCrZFoUsmAH3Q_6P5GRnbY';

// Create the client immediately with hardcoded keys to ensure it's available for all server functions
export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    global: {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);
