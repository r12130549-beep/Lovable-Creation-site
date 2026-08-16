import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getCoupons = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { listCouponsFromCloud } = await import("./cloud-data.server");
      return await listCouponsFromCloud();
    } catch (error: any) {
      console.error("Error fetching coupons:", error);
      return [];
    }
  });

export const validateCoupon = createServerFn({ method: "POST" })
  .validator((data: any) => z.object({ code: z.string(), extensionId: z.string().optional() }).parse(data))
  .handler(async ({ data }) => {
    try {
      const { validateCouponInCloud } = await import("./cloud-data.server");
      return await validateCouponInCloud(data.code, data.extensionId);
    } catch (error: any) {
      throw new Error(error.message || "Invalid coupon");
    }
  });

export const createCoupon = createServerFn({ method: "POST" })
  .validator((data: any) => {
    const raw = data?.data || (typeof data === 'string' ? JSON.parse(data) : data);
    return z.object({
      code: z.string(),
      discount_type: z.enum(['percentage', 'fixed']),
      discount_value: z.number(),
      extension_id: z.string().optional().nullable(),
      extension_ids: z.string().optional().nullable(),
      expiry_date: z.string().optional().nullable(),
      usage_limit: z.number().optional().nullable()
    }).parse(raw);
  })
  .handler(async ({ data }) => {
    try {
      const { createCouponInCloud } = await import("./cloud-data.server");
      const coupon = await createCouponInCloud(data);
      return { success: true, coupon };
    } catch (error: any) {
      console.error("Error creating coupon:", error);
      return { success: false, message: error.message };
    }
  });

export const deleteCoupon = createServerFn({ method: "POST" })
  .validator((data: any) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    try {
      const { deleteCouponInCloud } = await import("./cloud-data.server");
      await deleteCouponInCloud(data.id);
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting coupon:", error);
      return { success: false, message: error.message };
    }
  });

export const incrementCouponUsage = createServerFn({ method: "POST" })
  .validator((data: any) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    try {
      const { incrementCouponUsageInCloud } = await import("./cloud-data.server");
      await incrementCouponUsageInCloud(data.id);
      return { success: true };
    } catch (error: any) {
      console.error("Error incrementing coupon usage:", error);
      return { success: false };
    }
  });
