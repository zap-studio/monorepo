import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { requireEnv } from "@/lib/env";

import * as schema from "./schema";

const DATABASE_URL = requireEnv("DATABASE_URL");

const sql = neon(DATABASE_URL);
export const db = drizzle({ client: sql, schema });
