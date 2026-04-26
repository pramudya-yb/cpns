import { protectedProcedure, publicProcedure, router } from "../index";
import { aiRouter } from "./ai";
import { questionRouter } from "./question";
import { settingsRouter } from "./settings";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  ai: aiRouter,
  question: questionRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
