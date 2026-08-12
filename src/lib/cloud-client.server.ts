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

  const key = serviceRoleKey ?? fallbackKey;


  cached = createClient<Database>(url, key, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set('apikey', key);
        if (!headers.get('Authorization')) {
          headers.set('Authorization', `Bearer ${key}`);
        }
        return fetch(input, { ...init, headers });
      },
    },
  });

  return cached;
}
