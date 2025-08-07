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

import * as schema from "@/db/schema";
import { PROD } from "@/lib/env.public";
import { SERVER_ENV } from "@/lib/env.server";

type Database = NodePgDatabase<typeof schema> | NeonHttpDatabase<typeof schema>;

async function createDatabase(): Promise<Database> {
  if (PROD) {
    const client = neon(SERVER_ENV.DATABASE_URL);
    return drizzleNeon({ client, schema });
  }

  if (!SERVER_ENV.DATABASE_URL_DEV) {
    const { EnvironmentError } = await import("../zap/lib/api/errors");
    throw new EnvironmentError(
      "DATABASE_URL_DEV is required in development environment",
    );
  }

  const pool = new Pool({ connectionString: SERVER_ENV.DATABASE_URL_DEV });
  return drizzlePg({ client: pool, schema });
}

// FIXME: this is a workaround to make the db type compatible with the neon and node-postgres databases
export const db = (await createDatabase()) as NeonHttpDatabase<typeof schema>;

export type {
  DatabaseContext,
  DatabaseOperationResult,
  UpsertMode,
} from "./types";
