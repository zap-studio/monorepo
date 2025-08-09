import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";
import { SERVER_ENV } from "@/zap/env/server";

const client = neon(SERVER_ENV.DATABASE_URL);
export const db: NeonHttpDatabase<typeof schema> = drizzle({ client, schema });
