import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import { SERVER_ENV } from "@/zap/env/server";

import { type DatabaseSchema, schema } from "./schema";

const client = neon(SERVER_ENV.DATABASE_URL);
export const db: NeonHttpDatabase<DatabaseSchema> = drizzle({
  client,
  schema,
});
