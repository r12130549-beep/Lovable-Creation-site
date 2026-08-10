import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";
import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    const result = await next();
    
    // In TanStack Start v1, requestMiddleware MUST return a Response.
    // middleware.server next() for requestMiddleware returns a Response.
    // If for some reason it's undefined, we return a fallback.
    if (!result) {
      return new Response("OK", { status: 200 });
    }
    
    return result;
  } catch (error: any) {
    if (error instanceof Response) {
      return error;
    }
    
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

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
