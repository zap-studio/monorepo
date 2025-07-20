import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/db/schema";
import { ENV as CLIENT_ENV } from "@/lib/env.client";
import { ENV } from "@/lib/env.server";

let db: ReturnType<typeof drizzlePg> | ReturnType<typeof drizzle>;
if (CLIENT_ENV.NODE_ENV === "development") {
  const pool = new Pool({
    connectionString: ENV.DATABASE_URL_DEV,
  });
  db = drizzlePg({ client: pool, schema });
} else {
  const sql = neon(ENV.DATABASE_URL);
  db = drizzle({ client: sql, schema });
}

export { db };
