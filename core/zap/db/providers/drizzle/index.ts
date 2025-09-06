import "server-only";

import { neon } from "@neondatabase/serverless";
import {
  drizzle as drizzleNeon,
  type NeonHttpDatabase,
} from "drizzle-orm/neon-http";
import {
  drizzle as drizzlePg,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { PROD } from "@/zap/env/runtime/public";
import { SERVER_ENV } from "@/zap/env/server";

import { type DatabaseSchema, schema } from "./schema";

type Database =
  | NodePgDatabase<DatabaseSchema>
  | NeonHttpDatabase<DatabaseSchema>;

function createDatabase(): Database {
  if (PROD) {
    const client = neon(SERVER_ENV.DATABASE_URL);
    return drizzleNeon({ client, schema });
  }

  if (!SERVER_ENV.DATABASE_URL_DEV) {
    throw new Error("DATABASE_URL_DEV is required in development environment");
  }

  const pool = new Pool({ connectionString: SERVER_ENV.DATABASE_URL_DEV });
  return drizzlePg({ client: pool, schema });
}

// FIXME: this is a workaround to make the db type compatible with the neon and node-postgres databases
export const db = createDatabase() as NeonHttpDatabase<DatabaseSchema>;
