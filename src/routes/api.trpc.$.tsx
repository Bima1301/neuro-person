import { createFileRoute } from "@tanstack/react-router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { getSessionFromRequest } from "@/integrations/better-auth/auth";
import { createContext } from "@/integrations/trpc/init";
import { trpcRouter } from "@/integrations/trpc/router";

async function handler({ request }: { request: Request }) {
  const { userId, sessionId } = await getSessionFromRequest(request);

  if (import.meta.env.DEV) {
    console.log("[tRPC Handler] Session info:", { userId, sessionId });
  }

  return fetchRequestHandler({
    req: request,
    router: trpcRouter,
    endpoint: "/api/trpc",
    createContext: () => createContext({ sessionId, userId }),
  });
}

export const Route = createFileRoute("/api/trpc/$")({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
    },
  },
});
