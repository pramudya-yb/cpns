import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { generateQuestionsQuick } from "@labas/ai";
import { generationInputSchema } from "@labas/ai/schemas";
import { db } from "@labas/db";
import { question } from "@labas/db";

export const aiRouter = router({
  generate: protectedProcedure
    .input(generationInputSchema)
    .mutation(async ({ input }) => {
      const result = await generateQuestionsQuick(input);
      return result;
    }),

  saveQuestions: protectedProcedure
    .input(
      z.object({
        examTypeId: z.string(),
        sectionTypeId: z.string(),
        questions: z.array(z.any()),
        isPublic: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const created = await db
        .insert(question)
        .values(
          input.questions.map((q: any) => ({
            examTypeId: input.examTypeId,
            sectionTypeId: input.sectionTypeId,
            format: q.format,
            passageText: q.passageText,
            questionText: q.questionText,
            options: q.options ?? null,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            skillTags: q.skillTags,
            source: "ai" as const,
            aiModel: q.aiModel ?? null,
            creatorUserId: ctx.session.user.id,
            isPublic: input.isPublic,
          })),
        )
        .returning();

      return created;
    }),
});
