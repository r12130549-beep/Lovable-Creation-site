import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

let cached: SupabaseClient<Database> | null = null;

// Safe public fallbacks so a deployment without env vars (e.g. Vercel) still boots.
const FALLBACK_URL = "https://gxskutcwhatbkeaczyvd.supabase.co";
const FALLBACK_PUBLISHABLE_KEY = "sb_publishable_pvw14Jg_3BCrZFoUsmAH3Q_6P5GRnbY";

function firstDefined(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) return value.trim();
  }
  return undefined;
}

export function getCloudAdminClient() {
  if (cached) return cached;

  const url = firstDefined(
    'SUPABASE_URL',
    'VITE_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
  ) ?? FALLBACK_URL;

  const serviceRoleKey = firstDefined(
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_SECRET_KEY',
    'SERVICE_ROLE_KEY',
  );
  
  const fallbackKey = firstDefined(
    'SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_ANON_KEY',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
  ) ?? FALLBACK_PUBLISHABLE_KEY;

  // CRITICAL: We prioritize the service role key for "admin" actions, 
  // but if it's missing, we fall back to the publishable key.
  const key = serviceRoleKey ?? fallbackKey;

  // Log only the type of key being used, not the key itself
  if (!serviceRoleKey) {
    console.warn("Using fallback key for Cloud client. Admin actions may fail RLS.");
  }

  cached = createClient<Database>(url, key, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    },
  });

  return cached;
}
