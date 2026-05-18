import { createLazyFileRoute } from "@tanstack/react-router";
import { RouteComponent } from "@/components/routes/GeneratePage";

export const Route = createLazyFileRoute("/generate")({
  component: RouteComponent,
});
