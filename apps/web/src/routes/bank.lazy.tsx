import { createLazyFileRoute } from "@tanstack/react-router";
import { BankComponent } from "@/components/routes/BankPage";

export const Route = createLazyFileRoute("/bank")({
  component: BankComponent,
});
