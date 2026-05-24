import { defineConfig } from "drizzle-kit";

import { loadDatabaseUrl } from "./src/database-url";

export default defineConfig({
  schema: "./src/schema",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: loadDatabaseUrl(),
  },
});
