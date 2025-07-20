import "server-only";

import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import { db as dbDev } from "@/db/db.dev";
import { db as dbProd } from "@/db/db.prod";
import type * as schema from "@/db/schema";
import { SERVER_ENV } from "@/lib/env.server";

// this is a workaround to make the db type compatible with the neon and node-postgres databases (FIXME: this may be removed in the future)
type CommonDB = NeonHttpDatabase<typeof schema>;
export const db = (
  SERVER_ENV.NODE_ENV === "production" ? dbProd : dbDev
) as CommonDB;
