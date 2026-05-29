import { TRPCError } from "@trpc/server";
import { env } from "@labas/env/server";
import { logger } from "@labas/api/logger";

/**
 * Validates a Cloudflare Turnstile token server-side.
 * No-ops when CLOUDFLARE_TURNSTILE_SECRET_KEY is not configured.
 * Throws BAD_REQUEST if the token is missing or invalid when the key is set.
 */
export async function validateTurnstileToken(token: string | undefined): Promise<void> {
  const secretKey = env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  if (!secretKey) return;

  if (!token) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "CAPTCHA verification is required." });
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v1/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: secretKey, response: token }),
    });
    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    if (!data.success) {
      logger.warn("[TURNSTILE] Token verification failed", { errorCodes: data["error-codes"] });
      throw new TRPCError({ code: "BAD_REQUEST", message: "CAPTCHA verification failed. Please try again." });
    }
  } catch (err) {
    if (err instanceof TRPCError) throw err;
    // Fail open if the Cloudflare API is unreachable — don't block legitimate users
    logger.error("[TURNSTILE] Siteverify request failed, skipping", { error: (err as Error).message });
  }
}
