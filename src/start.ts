import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";
import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    const result = await next();
    
    // Safety check for request middleware return value
    if (result === undefined) {
      return new Response("OK", { status: 200 });
    }
    
    return result;
  } catch (error: any) {
    if (error instanceof Response) {
      return error;
    }
    
    console.error("CATASTROPHIC ERROR IN REQUEST MIDDLEWARE:", error);
    
    const message = error?.message || String(error);
    if (message.includes("Invalid API key") || message.includes("apiKey") || message.includes("auth")) {
       return new Response(JSON.stringify({ error: "Database configuration error", fallback: true }), {
         status: 200, 
         headers: { "content-type": "application/json" }
       });
    }

    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

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
