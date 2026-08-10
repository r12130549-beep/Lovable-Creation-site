// Helper to get admin client inside functions to avoid module-scope instantiation
async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}


export async function getAllUsersAdmin() {
  const supabase = await getAdmin();
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      orders:orders(count),
      licenses:licenses(count)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateUserStatus(userId: string, isSuspended: boolean) {
  // Using metadata to store suspension status since profile schema is locked
  const supabase = await getAdmin();
  const { error } = await supabase.auth.admin.updateUserById(
    userId,
    { user_metadata: { is_suspended: isSuspended } }
  );

  if (error) throw error;
  return { success: true };
}

export async function deleteUser(userId: string) {
  const supabase = await getAdmin();
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw error;
  return { success: true };
}

export async function updateUserRole(userId: string, role: string) {
  const supabase = await getAdmin();
  // Update in auth metadata
  const { error: authError } = await supabase.auth.admin.updateUserById(
    userId,
    { user_metadata: { role: role } }
  );
  if (authError) throw authError;

  // Also update in profiles table if role column exists (handling optionally)
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: role } as any)
    .eq('id', userId);
  
  return { success: true };
}