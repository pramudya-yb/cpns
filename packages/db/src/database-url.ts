import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const serverEnvPath = resolve(dirname(fileURLToPath(import.meta.url)), "../../../apps/server/.env");

export function loadDatabaseUrl(): string {
  if (!process.env.DATABASE_URL && existsSync(serverEnvPath)) {
    dotenv.config({ path: serverEnvPath });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Add it to Coolify environment variables (or apps/server/.env for local dev).",
    );
  }

  return databaseUrl;
}
