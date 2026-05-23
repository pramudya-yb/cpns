import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/history")({
  validateSearch: z.object({
    page: z.coerce.number().optional(),
    examTypeId: z.string().optional(),
    search: z.string().optional(),
  }).parse,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({ to: "/login", throw: true });
    }
    return { session };
  },
});
