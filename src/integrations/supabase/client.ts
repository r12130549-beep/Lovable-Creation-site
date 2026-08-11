import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use hardcoded values to prevent "Invalid API key" errors during server-side execution and deployment
const SUPABASE_URL = 'https://gxskutcwhatbkeaczyvd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pvw14Jg_3BCrZFoUsmAH3Q_6P5GRnbY';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});