import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { 
  adminFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from "./firebase-admin.server";

export const getAppSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const settingsRef = collection(adminFirestore, "app_settings");
      const querySnapshot = await getDocs(settingsRef);
      
      const settings: Record<string, any> = {};
      querySnapshot.forEach(doc => {
        const data = doc.data();
        settings[data.key] = data.value;
      });
      
      return settings;
    } catch (error: any) {
      console.error("Error in getAppSettings (Firebase):", error);
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
    try {
      // Use the key as the document ID for app_settings
      const settingRef = doc(adminFirestore, "app_settings", data.key);
      await setDoc(settingRef, { 
        key: data.key, 
        value: data.value,
        updated_at: new Date().toISOString()
      }, { merge: true });

      return { success: true };
    } catch (e: any) {
      console.error("Error in updateAppSetting (Firebase):", e);
      return { success: false, error: e.message };
    }
  });
