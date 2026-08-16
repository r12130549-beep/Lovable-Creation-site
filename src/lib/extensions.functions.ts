import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const str = z.any().transform((v) => (v === null || v === undefined ? undefined : String(v))).optional();
const num = z.any().transform((v) => (v === null || v === undefined || v === "" ? undefined : Number(v) || 0)).optional();
const arr = z.any().transform((v) => (Array.isArray(v) ? v : [])).optional();

const unwrap = (data: unknown) => {
  const raw: any = data && typeof data === "object" && "data" in (data as any) ? (data as any).data : (typeof data === 'string' ? JSON.parse(data) : data);
  return raw ?? {};
};

export const getExtensions = createServerFn({ method: "GET" })
  .validator((data: any) => z.object({
    category: z.string().optional(),
    slug: z.string().optional()
  }).optional().parse(data))
  .handler(async ({ data }) => {
    try {
      const { listExtensionsFromCloud } = await import("./cloud-data.server");
      const results = await listExtensionsFromCloud() as any[];

      // Manual filtering and sorting to bypass Firebase index requirements
      let filtered = results;
      if (data?.slug) {
        filtered = results.filter(ext => ext.slug === data.slug).slice(0, 1);
      } else if (data?.category && data.category !== "All") {
        filtered = results.filter(ext => ext.category === data.category);
      }

      return filtered.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
    } catch (error: any) {
      console.error("Error fetching extensions:", error);
      return [] as any[];
    }
  });

export const deleteExtension = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.any().transform((v) => String(v)) }).parse(unwrap(data)))
  .handler(async ({ data }) => {
    try {
      const { deleteExtensionInCloud } = await import("./cloud-data.server");
      await deleteExtensionInCloud(data.id);
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting extension from Cloud:", error);
      throw error;
    }
  });

export const updateExtension = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.any().transform((v) => String(v)),
        updates: z.any().transform((v) => (v && typeof v === "object" ? v : {})),
      })
      .parse(unwrap(data)),
  )
  .handler(async ({ data }) => {
    try {
      const { updateExtensionInCloud } = await import("./cloud-data.server");
      await updateExtensionInCloud(data.id, {
        ...(data.updates as any),
        updated_at: new Date().toISOString()
      });
      return { success: true };
    } catch (error: any) {
      console.error("Error updating extension in Cloud:", error);
      throw error;
    }
  });

export const createExtension = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        name: str,
        slug: str,
        description: str,
        price: num,
        price_usd: num,
        price_bdt: num,
        discount_price: num,
        category: str,
        icon_url: str,
        zip_url: str,
        version: str,
        status: str,
        features: arr,
        changelog: arr,
        compatibility: arr,
        screenshots: arr,
      })
      .parse(unwrap(data)),
  )
  .handler(async ({ data }) => {
    try {
      const { createExtensionInCloud } = await import("./cloud-data.server");
      const name = data.name?.trim() || "Untitled Extension";
      const slug =
        data.slug?.trim() ||
        `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Math.random()
          .toString(36)
          .slice(2, 6)}`;

      const payload: any = {
        name,
        slug,
        description: data.description ?? null,
        price: data.price_usd ?? data.price ?? 0,
        price_usd: data.price_usd ?? data.price ?? 0,
        price_bdt: data.price_bdt ?? null,
        category: data.category ?? null,
        icon_url: data.icon_url || null,
        zip_url: data.zip_url || null,
        version: data.version || "1.0.0",
        status: data.status || "published",
        features: data.features ?? [],
        changelog: data.changelog ?? [],
        compatibility: data.compatibility ?? [],
        screenshots: data.screenshots ?? [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      if (data.discount_price !== undefined) payload.discount_price = data.discount_price;

      const extension = await createExtensionInCloud(payload);
      
      return { success: true, extension };
    } catch (error: any) {
      console.error("Caught error in createExtension (Cloud):", error);
      return { success: false, message: error?.message || "Failed to create extension" };
    }
  });
