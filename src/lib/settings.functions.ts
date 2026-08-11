import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getAppSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { getAppSettingsFromCloud } = await import("./cloud-data.server");
      return await getAppSettingsFromCloud();
    } catch (error: any) {
      console.error("Error in getAppSettings (Cloud):", error);
      return {};
    }
  });

export const updateAppSetting = createServerFn({ method: "POST" })
  .validator((data: any) => {
    const raw = data?.data || (typeof data === 'string' ? JSON.parse(data) : data);
    return z.object({
      key: z.string(),
      value: z.any()
    }).parse(raw);
  })
  .handler(async ({ data }) => {
    try {
      const { updateAppSettingInCloud } = await import("./cloud-data.server");
      await updateAppSettingInCloud(data.key, data.value);
      return { success: true };
    } catch (e: any) {
      console.error("Error in updateAppSetting (Cloud):", e);
      return { success: false, error: e.message };
    }
  });
