import { createLazyFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/routes/LandingPage";

export const Route = createLazyFileRoute("/landing")({
  component: LandingPage,
});
