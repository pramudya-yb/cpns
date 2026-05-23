import { createLazyFileRoute } from "@tanstack/react-router";
import { HistoryComponent } from "@/components/routes/HistoryPage";

export const Route = createLazyFileRoute("/history")({
  component: HistoryComponent,
});
