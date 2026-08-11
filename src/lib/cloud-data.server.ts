import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export async function listOrdersFromCloud() {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data;
}

export async function createOrderInCloud(order: TablesInsert<"orders">) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert(order)
    .select("id, order_id")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateOrderInCloud(id: string, updates: TablesUpdate<"orders">) {
  const { error } = await supabaseAdmin.from("orders").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listExtensionsFromCloud() {
  const { data, error } = await supabaseAdmin
    .from("extensions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createExtensionInCloud(extension: TablesInsert<"extensions">) {
  const { data, error } = await supabaseAdmin
    .from("extensions")
    .insert(extension)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateExtensionInCloud(id: string, updates: TablesUpdate<"extensions">) {
  const { error } = await supabaseAdmin.from("extensions").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteExtensionInCloud(id: string) {
  const { error } = await supabaseAdmin.from("extensions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getAppSettingsFromCloud() {
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("*");
  if (error) throw new Error(error.message);
  
  const settings: Record<string, any> = {};
  data.forEach((row: any) => {
    settings[row.key] = row.value;
  });
  return settings;
}

export async function updateAppSettingInCloud(key: string, value: any) {
  const { error } = await supabaseAdmin
    .from("app_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
}