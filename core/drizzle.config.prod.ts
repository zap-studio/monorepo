import "dotenv/config";

import { defineConfig } from "drizzle-kit";

import { EnvironmentError } from "@/zap/errors";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new EnvironmentError("DATABASE_URL environment variable is required");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
    ssl: "require",
  },
});
