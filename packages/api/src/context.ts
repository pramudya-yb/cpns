import { auth } from "@labas/auth";
import type { Context as HonoContext } from "hono";
import { getClientIp } from "./lib/client-ip";

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });
  return {
    auth: null,
    session,
    ip: getClientIp(context),
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
