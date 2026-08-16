import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { getCloudAdminClient } from "./cloud-client.server";

export async function listOrdersFromCloud() {
  const supabaseAdmin = getCloudAdminClient();
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data;
}

export async function createOrderInCloud(order: TablesInsert<"orders">) {
  const supabaseAdmin = getCloudAdminClient();
  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert(order)
    .select("id, order_id")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateOrderInCloud(id: string, updates: TablesUpdate<"orders">) {
  const supabaseAdmin = getCloudAdminClient();
  const { error } = await supabaseAdmin.from("orders").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listExtensionsFromCloud() {
  const supabaseAdmin = getCloudAdminClient();
  const { data, error } = await supabaseAdmin
    .from("extensions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createExtensionInCloud(extension: TablesInsert<"extensions">) {
  const supabaseAdmin = getCloudAdminClient();
  const { data, error } = await supabaseAdmin
    .from("extensions")
    .insert(extension)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateExtensionInCloud(id: string, updates: TablesUpdate<"extensions">) {
  const supabaseAdmin = getCloudAdminClient();
  const { error } = await supabaseAdmin.from("extensions").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteExtensionInCloud(id: string) {
  const supabaseAdmin = getCloudAdminClient();
  const { error } = await supabaseAdmin.from("extensions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getAppSettingsFromCloud() {
  const supabaseAdmin = getCloudAdminClient();
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
  const supabaseAdmin = getCloudAdminClient();
  const { error } = await supabaseAdmin
    .from("app_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
}

export async function listCouponsFromCloud() {
  const supabaseAdmin = getCloudAdminClient();
  const { data, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createCouponInCloud(coupon: any) {
  const supabaseAdmin = getCloudAdminClient();
  const { data, error } = await supabaseAdmin
    .from("coupons")
    .insert(coupon)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCouponInCloud(id: string) {
  const supabaseAdmin = getCloudAdminClient();
  const { error } = await supabaseAdmin.from("coupons").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function validateCouponInCloud(code: string, extensionId?: string) {
  const supabaseAdmin = getCloudAdminClient();
  const { data: coupon, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .eq('code', code)
    .single();
  
  if (error || !coupon) throw new Error("Invalid coupon code");
  
  if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
    throw new Error("Coupon expired");
  }
  
  if (coupon.usage_limit && (coupon.used_count || 0) >= coupon.usage_limit) {
    throw new Error("Usage limit reached");
  }
  
  // Check if coupon is restricted to specific extensions
  const allowedIds = coupon.extension_ids ? coupon.extension_ids.split(',').filter(Boolean) : [];
  if (allowedIds.length > 0) {
    if (!extensionId) {
      throw new Error("Coupon not valid for this purchase");
    }
    if (!allowedIds.includes(extensionId)) {
      throw new Error("Coupon not valid for this product");
    }
  } else if (coupon.extension_id && extensionId && coupon.extension_id !== extensionId) {
    // Backward compatibility for old single extension_id column
    throw new Error("Coupon not valid for this product");
  }
  
  return coupon;
}

export async function incrementCouponUsageInCloud(id: string) {
  const supabaseAdmin = getCloudAdminClient();
  const { data: current } = await supabaseAdmin.from('coupons').select('used_count').eq('id', id).single();
  const newCount = (Number(current?.used_count ?? 0)) + 1;
  const { error } = await supabaseAdmin.from('coupons').update({ used_count: newCount }).eq('id', id);
  if (error) throw new Error(error.message);
}