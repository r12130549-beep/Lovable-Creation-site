import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const deleteExtension = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("extensions")
      .delete()
      .eq("id", data.id);

    if (error) throw error;
    return { success: true };
  });

export const updateExtension = createServerFn({ method: "POST" })
  .inputValidator((data) => 
    z.object({ 
      id: z.string(),
      updates: z.record(z.any())
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("extensions")
      .update(data.updates as any)
      .eq("id", data.id);

    if (error) throw error;
    return { success: true };
  });

export const createExtension = createServerFn({ method: "POST" })
  .inputValidator((data) => 
    z.object({ 
      name: z.string(),
      slug: z.string(),
      description: z.string().nullable().optional(),
      price: z.number().nullable().optional(),
      discount_price: z.number().nullable().optional(),
      category: z.string().nullable().optional(),
      icon_url: z.string().nullable().optional(),
      zip_url: z.string().nullable().optional(),
      version: z.string().nullable().optional(),
      status: z.enum(['draft', 'published', 'archived']).nullable().optional(),
      features: z.array(z.string()).nullable().optional(),
      changelog: z.array(z.object({ version: z.string(), date: z.string(), changes: z.array(z.string()) })).nullable().optional(),
      compatibility: z.array(z.string()).nullable().optional(),
      screenshots: z.array(z.string()).nullable().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { data: extension, error } = await supabaseAdmin
      .from("extensions")
      .insert({
        ...data,
        features: Array.isArray(data.features) ? data.features : [],
        changelog: Array.isArray(data.changelog) ? data.changelog : [],
        compatibility: Array.isArray(data.compatibility) ? data.compatibility : [],
      } as any)
      .select()
      .single();

    if (error) throw error;
    return extension;
  });
