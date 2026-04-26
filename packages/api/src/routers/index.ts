import { protectedProcedure, publicProcedure, router } from "../index";
import { aiRouter } from "./ai";
import { questionRouter } from "./question";
import { packageRouter } from "./package";
import { ratingRouter } from "./rating";
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
  package: packageRouter,
  rating: ratingRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
