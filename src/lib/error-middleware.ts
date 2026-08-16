import { createMiddleware } from "@tanstack/react-start";

import { isClientAbortError } from "./error-capture";
import { renderErrorPage } from "./error-page";

function getStatusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const candidate = error as { status?: unknown; statusCode?: unknown };
  const status = candidate.status ?? candidate.statusCode;
  return typeof status === "number" ? status : undefined;
}

export const errorMiddleware = createMiddleware({ type: "request" }).server(
  async ({ next }) => {
    try {
      return await next();
    } catch (error) {
      if (isClientAbortError(error)) {
        return new Response(null, { status: 499 });
      }

      const status = getStatusCode(error);
      if (status !== undefined && status < 500) throw error;

      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
);