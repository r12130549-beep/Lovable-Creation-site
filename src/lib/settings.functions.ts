import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";


export const getAppSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("app_settings")
      .select("*");

    if (error) throw error;
    
    // Transform to object for easier use
    const settings: Record<string, any> = {};
    data.forEach(item => {
      settings[item.key] = item.value;
    });
    
    return settings;
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
