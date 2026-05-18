import { eq, sql, and, desc, sum, gte } from "drizzle-orm";
import { db } from "@labas/db";
import { userCredit, creditTransaction, user, platformConfig } from "@labas/db";
import { TRPCError } from "@trpc/server";
import { env } from "@labas/env/server";

const COOLDOWN_DAYS = 7;

async function getConfigRaw(key: string): Promise<string | null> {
  const [row] = await db
    .select({ value: platformConfig.value })
    .from(platformConfig)
    .where(eq(platformConfig.key, key))
    .limit(1);
  return row?.value ?? null;
}

export async function getConfig(key: string, envFallback: () => string): Promise<string> {
  const dbVal = await getConfigRaw(key);
  return dbVal ?? envFallback();
}

export async function setConfig(key: string, value: string): Promise<void> {
  await db
    .insert(platformConfig)
    .values({ key, value })
    .onConflictDoUpdate({
      target: [platformConfig.key],
      set: { value },
    });
}

async function isFreeCreditsEnabled(): Promise<boolean> {
  const val = await getConfig("free_credits_enabled", () => String(env.FREE_CREDITS_ENABLED));
  return val === "true";
}

async function getFreeCreditsMaxPool(): Promise<number> {
  const val = await getConfig("free_credits_max_pool", () => String(env.FREE_CREDITS_MAX_POOL));
  return parseInt(val, 10) || env.FREE_CREDITS_MAX_POOL;
}

export async function getUserCredit(userId: string) {
  const [credit] = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);

  return credit ?? { userId, tokenBalance: 0, lifetimeTokensUsed: 0 };
}

export async function ensureUserCreditRow(userId: string) {
  await db
    .insert(userCredit)
    .values({ userId, tokenBalance: 0 })
    .onConflictDoNothing();
}

export async function deductCredit(
  userId: string,
  tokens: number,
): Promise<{ newBalance: number }> {
  await ensureUserCreditRow(userId);

  const [current] = await db
    .select({ balance: userCredit.tokenBalance })
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);

  if (!current) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "No credits available" });
  }

  if (current.balance < tokens) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient credits" });
  }

  const [updated] = await db
    .update(userCredit)
    .set({
      tokenBalance: sql`token_balance - ${tokens}`,
      lifetimeTokensUsed: sql`lifetime_tokens_used + ${tokens}`,
    })
    .where(eq(userCredit.userId, userId))
    .returning();

  if (!updated) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to deduct credits" });
  }

  await db.insert(creditTransaction).values({
    userId,
    amount: -tokens,
    type: "generation_spend",
    tokensUsed: tokens,
  });

  return { newBalance: updated.tokenBalance };
}

export async function isUserSuspended(userId: string): Promise<boolean> {
  const [u] = await db
    .select({ suspended: user.suspended })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return u?.suspended ?? false;
}

export async function grantSignupCredit(
  userId: string,
  amount: number,
): Promise<void> {
  await ensureUserCreditRow(userId);

  await db
    .update(userCredit)
    .set({
      tokenBalance: sql`token_balance + ${amount}`,
    })
    .where(eq(userCredit.userId, userId));

  await db.insert(creditTransaction).values({
    userId,
    amount,
    type: "signup_bonus",
    description: "Welcome credits",
  });
}

export async function getPoolUsage() {
  const maxPool = await getFreeCreditsMaxPool();
  const [agg] = await db
    .select({ totalDistributed: sum(creditTransaction.amount) })
    .from(creditTransaction)
    .where(gte(creditTransaction.amount, 0));

  const totalDistributed = Number(agg?.totalDistributed ?? 0);

  return {
    totalDistributed,
    maxPool,
    remaining: Math.max(0, maxPool - totalDistributed),
  };
}

export async function getLastRefillAt(userId: string) {
  const [txn] = await db
    .select({ createdAt: creditTransaction.createdAt })
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.userId, userId),
        gte(creditTransaction.amount, 0),
      ),
    )
    .orderBy(desc(creditTransaction.createdAt))
    .limit(1);

  return txn ?? null;
}

function calcCooldownRemaining(lastRefillAt: Date | string | null): number {
  if (!lastRefillAt) return 0;
  const last = new Date(lastRefillAt).getTime();
  const cooldownEnd = last + COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  const remaining = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / (24 * 60 * 60 * 1000)));
  return remaining;
}

export async function autoRefillIfEligible(
  userId: string,
): Promise<{ refilled: boolean; message: string; newBalance?: number }> {
  if (!(await isFreeCreditsEnabled())) {
    return { refilled: false, message: "Free credits are currently disabled." };
  }

  const pool = await getPoolUsage();
  const amount = env.DEFAULT_SIGNUP_CREDIT_TOKENS;

  if (pool.remaining < amount) {
    return { refilled: false, message: "Free credit pool is exhausted. Contact admin." };
  }

  const lastRefill = await getLastRefillAt(userId);
  const cooldown = calcCooldownRemaining(lastRefill?.createdAt ?? null);

  if (cooldown > 0) {
    return { refilled: false, message: `Cooldown active. Try again in ${cooldown} day(s).` };
  }

  await ensureUserCreditRow(userId);

  await db
    .update(userCredit)
    .set({
      tokenBalance: sql`token_balance + ${amount}`,
    })
    .where(eq(userCredit.userId, userId));

  await db.insert(creditTransaction).values({
    userId,
    amount,
    type: "auto_refill",
    description: "Auto-refill from free credit pool",
  });

  const credit = await getUserCredit(userId);

  return { refilled: true, message: `Refilled ${amount.toLocaleString()} tokens from free pool.`, newBalance: credit.tokenBalance };
}
