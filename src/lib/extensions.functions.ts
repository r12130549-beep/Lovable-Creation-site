import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const str = z.any().transform((v) => (v === null || v === undefined ? undefined : String(v))).optional();
const num = z.any().transform((v) => (v === null || v === undefined || v === "" ? undefined : Number(v) || 0)).optional();
const arr = z.any().transform((v) => (Array.isArray(v) ? v : [])).optional();

const unwrap = (data: unknown) => {
  const raw: any = data && typeof data === "object" && "data" in (data as any) ? (data as any).data : data;
  return raw ?? {};
};

export const deleteExtension = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.any().transform((v) => String(v)) }).parse(unwrap(data)))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("extensions").delete().eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const updateExtension = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.any().transform((v) => String(v)),
        updates: z.any().transform((v) => (v && typeof v === "object" ? v : {})),
      })
      .parse(unwrap(data)),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("extensions")
      .update(data.updates as any)
      .eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const createExtension = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        name: str,
        slug: str,
        description: str,
        price: num,
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
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

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
        price: data.price ?? 0,
        category: data.category ?? null,
        icon_url: data.icon_url || null,
        zip_url: data.zip_url || null,
        version: data.version || "1.0.0",
        status: data.status || "published",
        features: data.features ?? [],
        changelog: data.changelog ?? [],
        compatibility: data.compatibility ?? [],
        screenshots: data.screenshots ?? [],
      };
      if (data.discount_price !== undefined) payload.discount_price = data.discount_price;

      const { data: extension, error } = await supabaseAdmin
        .from("extensions")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return { success: true, extension };
    } catch (error: any) {
      console.error("Error creating extension:", error);
      return { success: false, message: error?.message || "Failed to create extension" };
    }
  });
