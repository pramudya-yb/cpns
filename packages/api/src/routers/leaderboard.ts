import { z } from "zod";
import { eq, and, sql, gte, desc } from "drizzle-orm";
import { router, protectedProcedure, publicProcedure } from "../index";
import { db } from "@labas/db";
import { testAttempt, testPackage, user } from "@labas/db";
import { paginationSchema, paginateDefaults } from "../lib/pagination";

const periodSchema = z.enum(["today", "week", "month", "all"]);

function getPeriodStart(period: z.infer<typeof periodSchema>): Date | null {
  const now = new Date();
  switch (period) {
    case "today": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "week": {
      const d = new Date(now);
      const day = d.getDay();
      const diff = day === 0 ? 6 : day - 1;
      d.setDate(d.getDate() - diff);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "month": {
      const d = new Date(now);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "all":
      return null;
  }
}

export const leaderboardRouter = router({
  getRankings: publicProcedure
    .input(
      z.object({
        period: periodSchema.default("week"),
        examTypeId: z.string().optional(),
        ...paginationSchema.shape,
      }),
    )
    .query(async ({ input }) => {
      const { limit, offset } = paginateDefaults(input);
      const periodStart = getPeriodStart(input.period);

      const conditions = [eq(testAttempt.status, "completed")];
      if (periodStart) {
        conditions.push(gte(testAttempt.finishedAt, periodStart));
      }

      const where = and(...conditions);

      const rankingsQuery = db
        .select({
          userId: user.id,
          name: user.name,
          image: user.image,
          totalScore: sql<number>`coalesce(sum(${testAttempt.totalScore}), 0)`,
          avgScorePct:
            sql<number>`round(coalesce(avg(case when ${testAttempt.maxScore} > 0 then (${testAttempt.totalScore}::float / ${testAttempt.maxScore}) * 100 end), 0)::numeric, 1)`,
          attemptsCount: sql<number>`count(*)`,
        })
        .from(testAttempt)
        .innerJoin(user, eq(testAttempt.userId, user.id));

      const countQuery = db
        .select({ count: sql<number>`count(distinct ${user.id})` })
        .from(testAttempt)
        .innerJoin(user, eq(testAttempt.userId, user.id));

      if (input.examTypeId) {
        rankingsQuery.innerJoin(
          testPackage,
          eq(testAttempt.packageId, testPackage.id),
        );
        countQuery.innerJoin(
          testPackage,
          eq(testAttempt.packageId, testPackage.id),
        );

        const examWhere = and(where, eq(testPackage.examTypeId, input.examTypeId));
        rankingsQuery.where(examWhere);
        countQuery.where(examWhere);
      } else {
        rankingsQuery.where(where);
        countQuery.where(where);
      }

      const rankings = await rankingsQuery
        .groupBy(user.id, user.name, user.image)
        .orderBy(desc(sql`sum(${testAttempt.totalScore})`))
        .limit(limit)
        .offset(offset);

      const [countResult] = await countQuery;

      return {
        rankings: rankings.map((r, i) => ({
          rank: offset + i + 1,
          userId: r.userId,
          name: r.name,
          image: r.image,
          totalScore: Number(r.totalScore),
          avgScorePct: Number(r.avgScorePct),
          attemptsCount: Number(r.attemptsCount),
        })),
        total: Number(countResult?.count ?? 0),
      };
    }),

  getMyRank: protectedProcedure
    .input(
      z.object({
        period: periodSchema.default("week"),
        examTypeId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const periodStart = getPeriodStart(input.period);

      const conditions = [eq(testAttempt.status, "completed")];
      if (periodStart) {
        conditions.push(gte(testAttempt.finishedAt, periodStart));
      }

      const baseWhere = and(...conditions);

      const query = db
        .select({
          userId: user.id,
          totalScore: sql<number>`coalesce(sum(${testAttempt.totalScore}), 0)`,
          avgScorePct:
            sql<number>`round(coalesce(avg(case when ${testAttempt.maxScore} > 0 then (${testAttempt.totalScore}::float / ${testAttempt.maxScore}) * 100 end), 0)::numeric, 1)`,
          attemptsCount: sql<number>`count(*)`,
        })
        .from(testAttempt)
        .innerJoin(user, eq(testAttempt.userId, user.id));

      if (input.examTypeId) {
        query.innerJoin(testPackage, eq(testAttempt.packageId, testPackage.id));
        query.where(and(baseWhere, eq(testPackage.examTypeId, input.examTypeId)));
      } else {
        query.where(baseWhere);
      }

      const allRankings = await query
        .groupBy(user.id)
        .orderBy(desc(sql`sum(${testAttempt.totalScore})`));

      const totalParticipants = allRankings.length;
      const myIndex = allRankings.findIndex((r) => r.userId === userId);

      if (myIndex === -1) {
        return {
          rank: null,
          totalParticipants,
          totalScore: 0,
          avgScorePct: 0,
          attemptsCount: 0,
        };
      }

      const myData = allRankings[myIndex]!;
      return {
        rank: myIndex + 1,
        totalParticipants,
        totalScore: Number(myData.totalScore),
        avgScorePct: Number(myData.avgScorePct),
        attemptsCount: Number(myData.attemptsCount),
      };
    }),
});
