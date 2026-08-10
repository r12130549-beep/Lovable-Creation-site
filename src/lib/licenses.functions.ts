import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { 
  generateLicenseKey, 
} from "./licenses.server";

const licenseStatusSchema = z.enum(["Active", "Expired", "Suspended", "Revoked"]);

export const getMyLicenses = createServerFn({ method: "GET" })
  .handler(async () => {
    // With Firebase switch, we rely on email-based tracking or public order ID tracking
    // For now, we return an empty list to prevent crashes on the dashboard
    return [];
  });

export const createLicenseAdmin = createServerFn({ method: "POST" })
  .validator((data: unknown) => 
    z.object({
      userId: z.string(),
      extensionId: z.string(),
      deviceLimit: z.number().int().min(1).default(3)
    }).parse(data)
  )

  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const key = generateLicenseKey();
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1); // 1 year default

    const { data: license, error } = await supabaseAdmin.from('licenses').insert({
      user_id: data.userId,
      extension_id: data.extensionId,
      key,
      status: 'Active',
      device_limit: data.deviceLimit,
      expires_at: expiry.toISOString()
    }).select().single();

    if (error) throw error;
    return license;
  });


export const updateLicenseAdmin = createServerFn({ method: "POST" })
  .validator((data: { 
    licenseId: string; 
    status?: "Active" | "Expired" | "Suspended" | "Revoked"; 
    deviceLimit?: number; 
    expiryDate?: string; 
    resetActivations?: boolean;
    downloadUrl?: string;
  }) => 
    z.object({
      licenseId: z.string(),
      status: licenseStatusSchema.optional(),
      deviceLimit: z.number().int().min(1).optional(),
      expiryDate: z.string().optional(),
      resetActivations: z.boolean().optional(),
      downloadUrl: z.string().url().optional()
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.resetActivations) {
      const { resetLicenseActivations } = await import("./licenses.server");
      await resetLicenseActivations(data.licenseId);
    }

    const updates: any = {};
    if (data.status) updates.status = data.status;
    if (data.deviceLimit) updates.device_limit = data.deviceLimit;
    if (data.expiryDate) updates.expires_at = data.expiryDate;
    if (data.downloadUrl) updates.download_url = data.downloadUrl;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabaseAdmin.from('licenses').update(updates).eq('id', data.licenseId);
      if (error) throw error;
    }

    return { success: true };
  });

export const getAdminLicenses = createServerFn({ method: "GET" })
  .handler(async () => {
    const { getAllLicensesAdmin } = await import("./licenses.server");
    return getAllLicensesAdmin();
  });
