import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getAppSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    console.log("DEBUG: getAppSettings called");
    try {
      const { createAdminClient } = await import("../integrations/supabase/client.server");
      const supabaseAdmin = createAdminClient();
      console.log("DEBUG: supabaseAdmin imported");
      
      const { data, error } = await supabaseAdmin
        .from("app_settings")
        .select("*");

      if (error) {
        console.warn("DEBUG: Supabase fetch error:", error.message);
        return {};
      }
      
      const settings: Record<string, any> = {};
      (data || []).forEach(item => {
        settings[item.key] = item.value;
      });
      
      console.log("DEBUG: getAppSettings success, keys:", Object.keys(settings));
      return settings;
    } catch (error: any) {
      console.error("DEBUG: Error in getAppSettings:", error);
      // Return a plain object to avoid the 'forgot to return a response' error
      return {};
    }
  });

export const updateAppSetting = createServerFn({ method: "POST" })
  .validator((data: any) => {
    const raw = data?.data || data;
    return z.object({
      key: z.string(),
      value: z.any()
    }).parse(raw);
  })
  .handler(async ({ data }) => {
    console.log("DEBUG: updateAppSetting called for key:", data.key);
    try {
      const { createAdminClient } = await import("@/integrations/supabase/client.server");
      const supabaseAdmin = createAdminClient();
      const { error } = await supabaseAdmin
        .from("app_settings")
        .upsert({ 
          key: data.key, 
          value: data.value,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("DEBUG: updateAppSetting error:", error);
        throw error;
      }
      return { success: true };
    } catch (e: any) {
      console.error("DEBUG: updateAppSetting catch:", e);
      return { success: false, error: e.message };
    }
  });
