import "dotenv/config";

import { defineConfig } from "drizzle-kit";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  const { EnvironmentError } = await import("./src/zap/lib/api/errors");
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
