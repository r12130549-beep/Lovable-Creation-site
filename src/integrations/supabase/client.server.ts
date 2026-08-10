import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Hardcoded keys for internal project access
// These are managed keys for the Lovable project gxskutcwhatbkeaczyvd
const SUPABASE_URL = 'https://gxskutcwhatbkeaczyvd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pvw14Jg_3BCrZFoUsmAH3Q_6P5GRnbY';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_pvw14Jg_3BCrZFoUsmAH3Q_6P5GRnbY';

// Helper to create clients with consistent header configuration
export const createAdminClient = () => createClient<Database>(
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

// Standard admin client instance
export const supabaseAdmin = createAdminClient();
