import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { router, protectedProcedure, publicProcedure } from "../index";
import { db } from "@labas/db";
import { question } from "@labas/db";

export const questionRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          examTypeId: z.string().optional(),
          sectionTypeId: z.string().optional(),
          format: z.string().optional(),
          difficulty: z.number().optional(),
          isPublic: z.boolean().optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;
      const conditions = [];

      if (input?.examTypeId) conditions.push(eq(question.examTypeId, input.examTypeId));
      if (input?.sectionTypeId) conditions.push(eq(question.sectionTypeId, input.sectionTypeId));
      if (input?.format) conditions.push(eq(question.format, input.format));
      if (input?.difficulty) conditions.push(eq(question.difficulty, input.difficulty));

      if (input?.isPublic !== undefined) {
        conditions.push(eq(question.isPublic, input.isPublic));
      } else if (!userId) {
        conditions.push(eq(question.isPublic, true));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const rows = await db
        .select()
        .from(question)
        .where(where)
        .orderBy(desc(question.createdAt))
        .limit(input?.limit ?? 20)
        .offset(input?.offset ?? 0);

      return rows;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [row] = await db
        .select()
        .from(question)
        .where(eq(question.id, input.id))
        .limit(1);
      return row ?? null;
    }),

  create: protectedProcedure
    .input(
      z.object({
        examTypeId: z.string(),
        sectionTypeId: z.string(),
        format: z.string(),
        passageText: z.string().min(1),
        questionText: z.string().min(1),
        options: z.any().optional(),
        correctAnswer: z.string(),
        explanation: z.string().optional(),
        difficulty: z.number().min(1).max(5).default(3),
        skillTags: z.array(z.string()).default([]),
        isPublic: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [row] = await db
        .insert(question)
        .values({
          ...input,
          source: "manual",
          creatorUserId: ctx.session.user.id,
        })
        .returning();
      return row;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(question)
        .where(and(eq(question.id, input.id), eq(question.creatorUserId, ctx.session.user.id)));
      return { success: true };
    }),
});
