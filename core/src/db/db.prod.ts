import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";
import { ENV } from "@/lib/env.server";

const client = neon(ENV.DATABASE_URL);
export const db: NeonHttpDatabase<typeof schema> = drizzle({ client, schema });
