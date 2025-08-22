import 'server-only';

import {
  drizzle as drizzlePg,
  type NodePgDatabase,
} from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { SERVER_ENV } from '@/zap/env/server';

import * as schema from './schema';

const pool = new Pool({ connectionString: SERVER_ENV.DATABASE_URL_DEV });

export const db: NodePgDatabase<typeof schema> = drizzlePg({
  client: pool,
  schema,
});
