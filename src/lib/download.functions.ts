import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSecureDownloadUrl } from "./download.server";

export const getDownloadUrl = createServerFn({ method: "POST" })
  .validator((data: { extensionId: string; licenseId: string }) => 
    z.object({
      extensionId: z.string().uuid(),
      licenseId: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    return getSecureDownloadUrl(data.extensionId, data.licenseId);
  });
