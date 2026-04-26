import { router, protectedProcedure } from "../index";

export const settingsRouter = router({
  // Placeholder for future settings endpoints (profile, preferences, etc.)
  getProfile: protectedProcedure.query(({ ctx }) => {
    return {
      id: ctx.session.user.id,
      name: ctx.session.user.name,
      email: ctx.session.user.email,
      image: ctx.session.user.image,
    };
  }),
});
