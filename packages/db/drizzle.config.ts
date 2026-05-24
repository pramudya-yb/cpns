import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

const serverEnvPath = resolve(dirname(fileURLToPath(import.meta.url)), "../../apps/server/.env");

// Coolify/production inject DATABASE_URL via process.env; .env file is local-dev only.
if (!process.env.DATABASE_URL && existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Add it to Coolify environment variables (or apps/server/.env for local dev).",
  );
}

export default defineConfig({
  schema: "./src/schema",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
