async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}


export function generateLicenseKey() {
  const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VIBEX-${segment()}-${segment()}-${segment()}`;
}


export async function getLicensesForUser(userId: string) {
  const supabase = await getAdmin();
  const { data, error } = await supabase
    .from('licenses')
    .select(`
      *,
      extension:extension_id(name, icon_url)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAllLicensesAdmin() {
  const supabase = await getAdmin();
  const { data, error } = await supabase
    .from('licenses')
    .select(`
      *,
      user:profiles(full_name),
      extension:extension_id(name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateLicenseStatus(licenseId: string, status: string) {
  const supabase = await getAdmin();
  const { error } = await supabase
    .from('licenses')
    .update({ status })
    .eq('id', licenseId);
  
  if (error) throw error;
}

export async function resetLicenseActivations(licenseId: string) {
  // Using any to bypass local type mismatch if types.ts hasn't updated yet
  const supabase = await getAdmin();
  const { error } = await supabase
    .from('licenses')
    .update({ activated_devices: 0 } as any)
    .eq('id', licenseId);
  
  if (error) throw error;
}

export async function extendLicenseExpiry(licenseId: string, days: number) {
  const supabase = await getAdmin();
  const { data: license } = await supabase
    .from('licenses')
    .select('expires_at')
    .eq('id', licenseId)
    .single();

  if (!license || !license.expires_at) throw new Error("License not found or has no expiry");

  const currentExpiry = new Date(license.expires_at);
  currentExpiry.setDate(currentExpiry.getDate() + days);

  const { error } = await supabase
    .from('licenses')
    .update({ expires_at: currentExpiry.toISOString() })
    .eq('id', licenseId);
  
  if (error) throw error;
}
