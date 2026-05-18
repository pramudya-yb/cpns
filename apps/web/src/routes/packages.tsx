import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/packages")({
  validateSearch: z.object({
    tab: z.enum(["all", "mine"]).optional(),
    search: z.string().optional(),
    examType: z.string().optional(),
    page: z.coerce.number().optional(),
    visibility: z.enum(["all", "private", "public"]).optional(),
  }).parse,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({ to: "/login", throw: true });
    }
    return { session };
  },
});
