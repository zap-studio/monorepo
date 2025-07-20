import "server-only";

import {
  drizzle as drizzlePg,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/db/schema";
import { SERVER_ENV } from "@/lib/env.server";

const pool = new Pool({ connectionString: SERVER_ENV.DATABASE_URL_DEV });

export const db: NodePgDatabase<typeof schema> = drizzlePg({
  client: pool,
  schema,
});
