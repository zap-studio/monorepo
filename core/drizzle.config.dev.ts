import "dotenv/config";

import { defineConfig } from "drizzle-kit";

const DATABASE_URL_DEV = process.env.DATABASE_URL_DEV;

if (!DATABASE_URL_DEV) {
  throw new Error("DATABASE_URL_DEV environment variable is required");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./zap/db/providers/drizzle/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL_DEV,
  },
});
