import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getAppSettings = createServerFn({ method: "GET" })
  .handler(async () => {
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
  .inputValidator((data) => 
    z.object({
      key: z.string(),
      value: z.any()
    }).parse(data)
  )
  .handler(async ({ data }) => {
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
