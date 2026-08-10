import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { 
  adminFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  limit
} from "./firebase-admin.server";

const licenseStatusSchema = z.enum(["Active", "Expired", "Suspended", "Revoked"]);

export const getMyLicenses = createServerFn({ method: "GET" })
  .handler(async () => {
    // Return empty for now as requested by previous logic context
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
    try {
      const key = `VIBEX-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);

      const licensesRef = collection(adminFirestore, "licenses");
      const licenseRef = doc(licensesRef);
      const licenseData = {
        id: licenseRef.id,
        user_id: data.userId,
        extension_id: data.extensionId,
        key,
        status: 'Active',
        device_limit: data.deviceLimit,
        expires_at: expiry.toISOString(),
        created_at: new Date().toISOString()
      };

      await setDoc(licenseRef, licenseData);
      return licenseData;
    } catch (error) {
      console.error("Error creating license:", error);
      throw error;
    }
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
      downloadUrl: z.string().optional()
    }).parse(data)
  )
  .handler(async ({ data }) => {
    try {
      const licenseRef = doc(adminFirestore, "licenses", data.licenseId);
      const updates: any = {};
      if (data.status) updates.status = data.status;
      if (data.deviceLimit) updates.device_limit = data.deviceLimit;
      if (data.expiryDate) updates.expires_at = data.expiryDate;
      if (data.downloadUrl) updates.download_url = data.downloadUrl;
      if (data.resetActivations) updates.activated_devices = 0;

      await updateDoc(licenseRef, updates);
      return { success: true };
    } catch (error) {
      console.error("Error updating license:", error);
      return { success: false };
    }
  });

export const getAdminLicenses = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const licensesRef = collection(adminFirestore, "licenses");
      const snapshot = await getDocs(query(licensesRef));
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching admin licenses:", error);
      return [];
    }
  });
