import { initTRPC, TRPCError } from "@trpc/server";
import { logger } from "./logger";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

// Logging middleware (available to use per-router)
export const loggedProcedure = t.procedure.use(({ ctx, path, type, next }) => {
  const start = Date.now();
  logger.info(`${type.toUpperCase()} ${path}`, { userId: ctx.session?.user.id });
  return next().finally(() => {
    logger.info(`${type.toUpperCase()} ${path} completed`, {
      userId: ctx.session?.user.id,
      durationMs: Date.now() - start,
    });
  });
});
