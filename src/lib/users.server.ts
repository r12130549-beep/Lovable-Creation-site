import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function getAllUsersAdmin() {
  const { data, error } = await supabaseAdmin
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
  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { user_metadata: { is_suspended: isSuspended } }
  );

  if (error) throw error;
  return { success: true };
}

export async function deleteUser(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw error;
  return { success: true };
}

export async function updateUserRole(userId: string, role: string) {
  // Update in auth metadata
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { user_metadata: { role: role } }
  );
  if (authError) throw authError;

  // Also update in profiles table if role column exists (handling optionally)
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ role: role } as any)
    .eq('id', userId);
  
  return { success: true };
}