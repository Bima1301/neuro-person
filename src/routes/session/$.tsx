import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/integrations/better-auth/auth";

export const Route = createFileRoute("/session/$")({
    server: {
        handlers: {
            GET: async ({ request }) => {
                return auth.handler(request);
            },
            POST: async ({ request }) => {
                return auth.handler(request);
            },
        },
    },
});