import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { prisma } from "@/db";

export interface Context {
  organizationId: string | null;
  userId: string | null;
  sessionId: string | null;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Logging middleware for development
const loggingMiddleware = t.middleware(async ({ path, type, next, input }) => {
  const isDev = import.meta.env.DEV;
  const start = Date.now();

  if (isDev) {
    console.group(`[tRPC] ${type.toUpperCase()} ${path}`);
    console.log("Input:", input);
  }

  try {
    const result = await next();

    if (isDev) {
      const duration = Date.now() - start;
      console.log("✅ Success", `(${duration}ms)`);
      if (result) {
        console.log("Result:", result);
      }
      console.groupEnd();
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;

    if (isDev) {
      console.error("❌ Error", `(${duration}ms)`);
      if (error instanceof TRPCError) {
        console.error("Code:", error.code);
        console.error("Message:", error.message);
        console.error("Cause:", error.cause);
      } else if (error instanceof Error) {
        console.error("Error:", error.message);
        console.error("Stack:", error.stack);
      } else {
        console.error("Unknown error:", error);
      }
      console.groupEnd();
    }

    throw error;
  }
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure.use(loggingMiddleware);

// Protected procedure - requires organization context
export const protectedProcedure = t.procedure
  .use(loggingMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.organizationId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Organization not found. Please login first.",
      });
    }

    return next({
      ctx: {
        ...ctx,
        organizationId: ctx.organizationId,
      },
    });
  });

// Helper to get organization ID from Better Auth session
export async function createContext(opts: {
  sessionId?: string | null;
  userId?: string | null;
}): Promise<Context> {
  // If we have userId directly, use it (preferred method)
  if (opts.userId) {
    const user = await prisma.user.findUnique({
      where: { id: opts.userId },
      select: { id: true, organizationId: true },
    });

    if (!user) {
      if (import.meta.env.DEV) {
        console.log("[tRPC Context] User not found for userId:", opts.userId);
      }
      return { organizationId: null, userId: null, sessionId: null };
    }

    if (import.meta.env.DEV) {
      console.log("[tRPC Context] User found:", {
        userId: user.id,
        organizationId: user.organizationId,
      });
    }

    // If user doesn't have organizationId, return null (user needs to complete onboarding)
    return {
      organizationId: user.organizationId || null,
      userId: user.id || null,
      sessionId: opts.sessionId || null,
    };
  }

  // Otherwise, get from session ID
  if (!opts.sessionId) {
    if (import.meta.env.DEV) {
      console.log("[tRPC Context] No sessionId or userId provided");
    }
    return { organizationId: null, userId: null, sessionId: null };
  }

  // Get session from Better Auth
  const session = await prisma.session.findUnique({
    where: { id: opts.sessionId },
    include: {
      user: {
        select: { id: true, organizationId: true },
      },
    },
  });

  if (!session || !session.user) {
    if (import.meta.env.DEV) {
      console.log(
        "[tRPC Context] Session not found for sessionId:",
        opts.sessionId,
      );
    }
    return { organizationId: null, userId: null, sessionId: null };
  }

  if (import.meta.env.DEV) {
    console.log("[tRPC Context] Session found:", {
      sessionId: session.id,
      userId: session.user.id,
      organizationId: session.user.organizationId,
    });
  }

  return {
    organizationId: session.user.organizationId || null,
    userId: session.user.id || null,
    sessionId: opts.sessionId,
  };
}
