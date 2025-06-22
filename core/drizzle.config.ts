import { requireEnv } from "@/lib/env";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const DATABASE_URL = requireEnv("DATABASE_URL");

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
    ssl: "require",
  },
});
