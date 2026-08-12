import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const ALLOWED_BUCKETS = ["payments", "order-assets"] as const;

function parseStoragePath(input: string): { bucket: string; path: string } | null {
  for (const bucket of ALLOWED_BUCKETS) {
    const marker = `/${bucket}/`;
    const idx = input.indexOf(marker);
    if (idx !== -1) {
      const path = input.slice(idx + marker.length).split("?")[0];
      if (path) return { bucket, path };
    }
    if (input.startsWith(`${bucket}/`)) {
      const path = input.slice(bucket.length + 1);
      if (path) return { bucket, path };
    }
  }
  return null;
}

/**
 * Returns a short-lived signed URL for a private payment/order asset.
 * Only signed-in admins may call this.
 */
export const getOrderAssetSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const raw = (data as any)?.data ?? data;
    return z.object({ url: z.string().min(1).max(2048) }).parse(raw);
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const parsed = parseStoragePath(data.url);
    if (!parsed) throw new Error("Invalid asset reference");

    const { getCloudAdminClient } = await import("./cloud-client.server");
    const admin = getCloudAdminClient();
    const { data: signed, error } = await admin.storage
      .from(parsed.bucket)
      .createSignedUrl(parsed.path, 300);

    if (error || !signed) throw new Error("Could not generate secure link");
    return { url: signed.signedUrl };
  });
