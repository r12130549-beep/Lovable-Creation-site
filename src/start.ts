import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    const result = await next();
    return result;
  } catch (error: any) {
    if (error instanceof Response) {
      return error;
    }
    
    // Check if it's a Supabase API key error
    const message = error?.message || String(error);
    if (message.includes("Invalid API key") || message.includes("apiKey") || message.includes("auth")) {
       console.error("Supabase API Key Error detected, providing fallback response:", message);
       return new Response(JSON.stringify({ error: "Database configuration error", fallback: true }), {
         status: 200, 
         headers: { "content-type": "application/json" }
       });
    }

    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("Server Error:", error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
