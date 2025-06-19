# Database

**Zap.ts** uses a _modern_, _type-safe_ database stack built on [Drizzle ORM](https://orm.drizzle.team/) and [PostgreSQL](https://www.postgresql.org/) by default.

The setup is designed for _flexibility_, _developer productivity_, and _end-to-end type safety_.

## Overview

- **Drizzle ORM:** Type-safe, SQL-friendly ORM for schema definition and queries.
- **Extensible:** Easily add new tables, relations, or swap out the database.
- **Migrations:** Simple, reliable schema migrations with Drizzle CLI.
- **PostgreSQL:** Production-ready, scalable relational database.
- **Type Safety:** All schemas and queries are fully typed with TypeScript.

## How it works?

### 1. Schema definition

All database schemas are defined using Drizzle's SQL-like schema syntax in the `src/db/schema/` directory.

Example:

```ts
// src/db/schema/auth.sql.ts
import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### 2. Database client

The Drizzle client is set up in `src/db/index.ts` and used throughout your app for queries and mutations.

### 3. Running migrations

Migrations are managed with the Drizzle CLI. You can generate, run, and manage migrations using the following commands:

```bash
pnpm db:generate   # Create migration files
pnpm db:migrate    # Run pending migrations
pnpm db:push       # Apply schema changes to the database
pnpm db:studio     # Open Drizzle Studio to inspect your database
```

See [Getting Started > Quick Scripts](/docs/introduction/getting-started.md#quick-scripts) for more.

### 4. Querying the database

Use the Drizzle client (`db`) in your server actions, API routes, or procedures:

```ts
// Example: Fetch all users
import { db } from "@/db";
import { users } from "@/db/schema";

const allUsers = await db.select().from(users);
```

### 5. Prepare queries and execute them

For performance and security, you can use Drizzle's `.prepare()` and `.execute()` methods to optimize and safely reuse queries.

Prepared queries are **compiled once** and can be **executed multiple times** with different parameters, _reducing overhead_ and _risk of SQL injection_.

Example:

```ts
// src/zap/db/queries/feedbacks.query.ts
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { feedback } from "@/db/schema";

// Prepare a query to fetch feedback for a user
export const getFeedbackForUserQuery = db
  .select()
  .from(feedback)
  .where(eq(feedback.userId, sql.placeholder("userId")))
  .limit(1)
  .prepare("getFeedbackForUser");

// Execute the prepared query
const feedbackResult = await getFeedbackForUserQuery.execute({ userId: "123" });
```

So, in short:

- Use `.prepare("queryName")` to define a reusable, named query.
- Use `.execute(params)` to run the query with specific parameters.

This pattern is recommended for queries used in **API routes**, **server actions**, and **oRPC procedures**.

## Customizing the database

- **Add a table:** Create a new `.sql.ts` file in `src/db/schema/` and export your table.
- **Change database:** Update your `DATABASE_URL` in `.env` and Drizzle config.
- **Edit a table:** Update the schema file and generate a migration.

For more, see the [Drizzle ORM documentation](https://orm.drizzle.team/docs/overview).

## References

### `schema/index.ts`

```ts
// src/db/schema/index.ts
export * from "@/zap/db/schema/ai.sql";
export * from "@/zap/db/schema/auth.sql";
export * from "@/zap/db/schema/feedback.sql";
export * from "@/zap/db/schema/notifications.sql";
```

###  `db`

```ts
// src/db/index.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const sql = neon(databaseUrl);
export const db = drizzle({ client: sql, schema });
```