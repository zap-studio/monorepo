import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { ENV } from "@/lib/env.server";

import * as schema from "./schema";

const sql = neon(ENV.DATABASE_URL);
export const db = drizzle({ client: sql, schema });
