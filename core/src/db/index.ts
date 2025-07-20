import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import {
  drizzle as drizzlePg,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/db/schema";
import { ENV as CLIENT_ENV } from "@/lib/env.client";
import { ENV } from "@/lib/env.server";

type DatabaseClient =
  | NeonHttpDatabase<typeof schema>
  | NodePgDatabase<typeof schema>;

let dbClient: DatabaseClient;
if (CLIENT_ENV.NODE_ENV === "development") {
  const pool = new Pool({
    connectionString: ENV.DATABASE_URL_DEV,
  });
  dbClient = drizzlePg({ client: pool, schema });
} else {
  const sql = neon(ENV.DATABASE_URL);
  dbClient = drizzle({ client: sql, schema });
}

export const db = dbClient;
