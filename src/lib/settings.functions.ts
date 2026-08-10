import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";


export const getAppSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { supabaseAdmin } = await import("../integrations/supabase/client.server");
      
      // Attempt to fetch settings, but don't crash if database is unavailable
      const { data, error } = await supabaseAdmin
        .from("app_settings")
        .select("key, value");

      if (error) {
        console.warn("Supabase warning fetching settings (possibly table doesn't exist yet):", error.message);
        return {};
      }
      
      const settings: Record<string, any> = {};
      (data || []).forEach(item => {
        settings[item.key] = item.value;
      });
      
      return settings;
    } catch (error: any) {
      console.warn("Silent catch in getAppSettings:", error.message);
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert({ 
        key: data.key, 
        value: data.value,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true };
  });
