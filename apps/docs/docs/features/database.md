# Database

Zap.ts uses a _modern_, _type-safe_ database stack built on [Drizzle ORM](https://orm.drizzle.team/) and [PostgreSQL](https://www.postgresql.org/) by default.

The setup is designed for _flexibility_, _developer productivity_, and _end-to-end type safety_.

## Overview

- **Drizzle ORM:** Type-safe, SQL-friendly ORM for schema definition and queries.
- **Extensible:** Easily add new tables, relations, or swap out the database.
- **Migrations:** Simple, reliable schema migrations with Drizzle CLI.
- **PostgreSQL:** Production-ready, scalable relational database.
- **Type Safety:** All schemas and queries are fully typed with TypeScript.

## How it works?

### 1. Schema Definition

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

### 2. Database Client

The Drizzle client is set up in `src/db/index.ts` and used throughout your app for queries and mutations.

### 3. Running Migrations

Migrations are managed with the Drizzle CLI. Zap.ts supports two database configurations:

- **Development**: Local PostgreSQL database (requires `DATABASE_URL_DEV` in your `.env`)
- **Production**: Neon PostgreSQL database (uses `DATABASE_URL`)

#### Development Commands

```bash
npm run db:generate:dev   # Create migration files for local database
npm run db:migrate:dev    # Run pending migrations on local database
npm run db:push:dev       # Apply schema changes to local database
npm run db:studio:dev     # Open Drizzle Studio for local database
```

#### Production Commands

```bash
npm run db:generate       # Create migration files for production database
npm run db:migrate        # Run pending migrations on production database
npm run db:push           # Apply schema changes to production database
npm run db:studio         # Open Drizzle Studio for production database
```

:::warning
You may need to disable your VPN when applying migrations, as VPN connections can sometimes interfere with database connectivity and cause connection timeouts.
:::

#### Environment Setup

For development, add to your `.env` file:

```bash
# Production database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Development database (Local PostgreSQL)
DATABASE_URL_DEV="postgresql://postgres:password@localhost:5432/zap_dev"
```

The application automatically switches between development and production databases based on the `NODE_ENV` environment variable.

See [Getting Started > Quick Scripts](/docs/introduction/getting-started.md#quick-scripts) for more.

### 4. Querying the Database

Use the Drizzle client (`db`) in your server actions, API routes, or procedures:

```ts
// Example: Fetch all users
import { db } from "@/db";
import { users } from "@/db/schema";

const allUsers = await db.select().from(users);
```

### 5. Prepare Queries and Execute Them

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

## Database Configuration

Zap.ts uses a dual database configuration system:

### Development vs Production

- **Development**: Uses local PostgreSQL database with `DATABASE_URL_DEV`
- **Production**: Uses Neon or the PostgreSQL database of your choice with `DATABASE_URL`

The application automatically detects the environment and switches between configurations based on:
- `NODE_ENV` environment variable
- Presence of `DATABASE_URL_DEV` in your environment

### Configuration Files

- `drizzle.config.dev.ts` - Development configuration (Local PostgreSQL)
- `drizzle.config.prod.ts` - Explicit production configuration (Neon with SSL or the provider of your choice)

### Database Client

The database client in `src/db/index.ts` automatically handles the connection switching:

```ts
// Automatically uses local PostgreSQL in development
// and your provider in production
import { db } from "@/db";
```

## Customizing the Database

- **Add a table:** Create a new `.sql.ts` file in `src/db/schema/` and export your table.
- **Change database:** Update your `DATABASE_URL` and `DATABASE_URL_DEV` in `.env`.
- **Edit a table:** Update the schema file and generate a migration.

For more, see the [Drizzle ORM documentation](https://orm.drizzle.team/docs/overview).

## Setting Up Local PostgreSQL

To use the development database configuration, you'll need a local PostgreSQL instance.

**Why we use the `postgres` user**: We default to using the `postgres` superuser for local development to avoid permission issues. The `postgres` user has full privileges and can create, modify, and access all schemas and tables without additional configuration.

### Using Homebrew (macOS)

```bash
# Install PostgreSQL
brew install postgresql@17

# Start PostgreSQL service
brew services start postgresql@17

# Connect to PostgreSQL and create database
psql postgres

# Create the database
CREATE DATABASE zap_dev;

# Exit psql
\q
```

Your `DATABASE_URL_DEV` would be:
```
postgresql://postgres:password@localhost:5432/zap_dev
```

### Using Docker

If you prefer using Docker for PostgreSQL:

```bash
# Create a Docker container for PostgreSQL
docker run --name zap-postgres \
  -e POSTGRES_DB=zap_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Your DATABASE_URL_DEV would be:
# postgresql://postgres:password@localhost:5432/zap_dev
```

### Using PostgreSQL Installer

1. Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
2. Create a database named `zap_dev`
3. Update your `.env` with the connection string
