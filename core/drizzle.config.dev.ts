import "dotenv/config";

import { defineConfig } from "drizzle-kit";

import { EnvironmentError } from "./zap/errors";

const DATABASE_URL_DEV = process.env.DATABASE_URL_DEV;

if (!DATABASE_URL_DEV) {
  throw new EnvironmentError(
    "DATABASE_URL_DEV environment variable is required",
  );
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL_DEV,
  },
});
