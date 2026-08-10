import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { 
  adminFirestore, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where,
  limit
} from "./firebase-admin.server";

export const getExtensions = createServerFn({ method: "GET" })
  .validator((data: any) => z.object({
    category: z.string().optional(),
    slug: z.string().optional()
  }).optional().parse(data))
  .handler(async ({ data }) => {
    try {
      const extensionsRef = collection(adminFirestore, "extensions");
      let q;

      if (data?.slug) {
        q = query(extensionsRef, where("slug", "==", data.slug), limit(1));
      } else if (data?.category && data.category !== "All") {
        q = query(extensionsRef, where("category", "==", data.category), orderBy("created_at", "desc"));
      } else {
        q = query(extensionsRef, orderBy("created_at", "desc"));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      console.error("Error fetching extensions:", error);
      return [];
    }
  });
