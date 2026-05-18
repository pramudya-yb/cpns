import { createLazyFileRoute } from "@tanstack/react-router";
import { RouteComponent } from "@/components/routes/SettingsPage";

export const Route = createLazyFileRoute("/settings")({
  component: RouteComponent,
});
