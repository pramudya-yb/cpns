import { createLazyFileRoute } from "@tanstack/react-router";
import { PackagesComponent } from "@/components/routes/PackagesPage";

export const Route = createLazyFileRoute("/packages")({
  component: PackagesComponent,
});
