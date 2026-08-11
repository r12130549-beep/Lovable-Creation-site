import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Read from process.env if available, otherwise use hardcoded fallbacks
// These are managed keys for the Lovable project gxskutcwhatbkeaczyvd
const getEnv = (key: string, fallback: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL', 'https://gxskutcwhatbkeaczyvd.supabase.co');
const SUPABASE_SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY', 'sb_secret_pvw14Jg_3BCrZFoUsmAH3Q_6P5GRnbY');

// Helper to create clients with consistent header configuration
export const createAdminClient = () => {
  const url = 'https://gxskutcwhatbkeaczyvd.supabase.co';
  const key = 'sb_secret_pvw14Jg_3BCrZFoUsmAH3Q_6P5GRnbY';
  
  return createClient<Database>(
    url,
    key,
    {
      global: {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
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
