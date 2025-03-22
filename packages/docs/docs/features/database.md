# Database

Welcome to the Database Setup guide for Zap.ts! This page helps you set up your database easily. We’ll talk about the `DATABASE_URL` in your `.env.local` file, the choice between Drizzle and Prisma, and how to use them in Zap.ts. We’ll also share a core schema that works with any ORM (Object-Relational Mapping tool).

:::warning
You can use a different ORM, but most other Zap.ts plugins won't be compatible.
:::

## DATABASE_URL variable

To connect Zap.ts to your database, you need to set the `DATABASE_URL` in your `.env.local` file. This is a string that tells Zap.ts where your database lives and how to log in.

### How to Set It Up

1. Open your `.env.local` file in the root of your project.
2. Find the line that says:
   ```
   DATABASE_URL=your_database_url_here
   ```
3. Replace `your_database_url_here` with your actual database URL.

### Example

If you’re using [Neon](https://neon.tech/docs/connect/connect-from-any-app) (our default database), your `DATABASE_URL` might look like this:

```
DATABASE_URL=postgres://your_username:your_password@your-neon-hostname:5432/your_database_name
```

- `your_username`: Your Neon username.
- `your_password`: Your Neon password.
- `your-neon-hostname`: The hostname from Neon (e.g., `ep-silent-forest-123456.us-east-2.aws.neon.tech`).
- `your_database_name`: The name of your database (e.g., `mydb`).

If you’re using another database like [Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres) or a local PostgreSQL, the format is similar but the hostname and credentials will be different.

::: tip
Make sure your database is running and you can connect to it. You can test it with a tool like `psql` or a database GUI like pgAdmin.
:::

## Choosing Between Drizzle and Prisma

Zap.ts lets you pick an ORM to talk to your database. An ORM helps you write database code in JavaScript or TypeScript instead of raw SQL. You must choose **one** of these ORMs:

- **Drizzle**: Available and recommended. It’s lightweight and easy to use.
- **Prisma**: Not available yet, but we’re working on it!

When you run `bun run zap:init`, the script will ask you to pick an ORM. Let’s look at each one.

## Drizzle

Drizzle is the default ORM in Zap.ts. It’s a modern, lightweight ORM that works well with PostgreSQL (and other databases). We recommend reading the [Drizzle documentation](https://orm.drizzle.team/docs/overview) first to understand it better. But don’t worry—we’ll summarize the key ideas here to get you started!

### Key Concepts to Understand

#### Codebase-First vs. Database-First

Drizzle supports two ways to work with your database:

- **Codebase-First**: You write your database schema (structure) in TypeScript files, and Drizzle creates the database tables for you. This is great for new projects because you control everything in your code.

  - Example: You write a `user` table in `src/db/schema/auth.ts`, then run `bun run db:push` to create the table in your database.

- **Database-First**: You already have a database with tables, and Drizzle generates TypeScript code to match it. This is useful if you’re working with an existing database.
  - Example: You have a database with a `user` table, and you run `bun run db:pull` to create a schema file in `src/db/schema/`.

In Zap.ts, we use the **codebase-first** approach by default because it’s easier to manage for new projects.

#### How to Write a Schema

A schema in Drizzle is a TypeScript file where you define your database tables. You use Drizzle’s functions like `pgTable` to create tables and columns.

Here’s a simple example of a schema for a `user` table:

```typescript
// src/db/schema/auth.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
});
```

- `pgTable("user", {...})`: Creates a table named `user`.
- `id: text("id").primaryKey()`: A column named `id` that’s a text string and the primary key.
- `name: text("name").notNull()`: A column named `name` that’s a text string and cannot be empty.
- `email: text("email").notNull().unique()`: A column named `email` that’s a text string, cannot be empty, and must be unique.
- `createdAt: timestamp("created_at").notNull()`: A column named `created_at` that’s a timestamp and cannot be empty.

After writing your schema, run `bun run db:push` to create the tables in your database.

#### Drizzle Structure in Zap.ts

Drizzle in Zap.ts is set up in two main places: `drizzle.config.ts` and the `src/db/` folder.

##### drizzle.config.ts

The `drizzle.config.ts` file in the root of your project tells Drizzle how to connect to your database and where your schema files are. Here’s what it looks like:

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema", // All schema files are in src/db/schema/
  out: "./drizzle", // Where migration files go (you don’t need to change this)
  dialect: "postgresql", // We use PostgreSQL by default
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Uses the DATABASE_URL from .env.local
  },
});
```

- `schema: "./src/db/schema"`: Points to the folder where your schema files live (`src/db/schema/`).
- `dialect: "postgresql"`: Tells Drizzle we’re using PostgreSQL. Check the [Drizzle docs](https://orm.drizzle.team/docs/drizzle-config-file#dialect) for other options like MySQL or SQLite.
- `dbCredentials.url`: Uses the `DATABASE_URL` from your `.env.local` to connect to the database.

##### src/db Folder

The `src/db/` folder has the code to connect to your database and work with it. Here’s what’s inside:

- **`src/db/index.ts`**: This file sets up the Drizzle client and connects to your database.

  ```typescript
  // src/db/index.ts
  import { neon } from "@neondatabase/serverless";
  import { drizzle } from "drizzle-orm/neon-http";
  import * as schema from "./schema";

  const sql = neon(process.env.DATABASE_URL!);

  export const db = drizzle({ client: sql, schema });
  ```

  - `neon`: We use Neon as the default database provider. It’s a serverless PostgreSQL database.
  - `process.env.DATABASE_URL`: Gets the database URL from your `.env.local`.
  - `drizzle({ client: sql, schema })`: Creates a Drizzle client with the Neon connection and your schema for type safety.
  - `schema`: Imports all schema files from `src/db/schema/` so Drizzle knows your tables.

  If you want to use a different database (like Supabase or a local PostgreSQL), check the [Drizzle docs](https://orm.drizzle.team/docs/get-started) to change the client. For example, to use a local PostgreSQL, you’d use `pg` instead of `neon`.

- **`src/db/schema/`**: This folder has all your schema files, like `auth.ts` (for user authentication) and `notifications.ts` (for PWA notifications). We’ll talk more about the schema later in the Core Schema section.

#### Bonus: Using Supabase with RLS

Supabase is a great alternative to Neon for your database. It’s a PostgreSQL database with extra features like Row-Level Security (RLS), which lets you control who can see or change data based on user roles.

Here’s how to set up Supabase with RLS in Zap.ts:

1. **Get Your Supabase URL**:

   - Sign up for Supabase and create a project.
   - Go to your project settings in the Supabase dashboard and find the database connection string (it looks like `postgres://...`).
   - Copy the connection string and add it to your `.env.local` as the `DATABASE_URL`.

2. **Enable RLS in Supabase**:

   - In the Supabase dashboard, go to the “Authentication” section and set up your user roles.
   - Go to the “Database” section, select a table (e.g., `user`), and enable RLS.
   - Add a policy, like “Allow users to read their own data”:
     ```sql
     CREATE POLICY user_read_own_data ON user
     FOR SELECT
     USING (auth.uid() = id);
     ```
     This policy means users can only see their own user data.

3. **Update Drizzle to Work with Supabase**:

   - You need to switch to Supabase’s client directly. Check the [Drizzle docs for Supabase](https://orm.drizzle.team/docs/get-started/supabase-new) for more details.

4. **Test Your Setup**:
   - Test your app to make sure RLS is working—users should only see data they’re allowed to see.

:::tip
Drizzle allows for [RLS and policy support](https://orm.drizzle.team/docs/rls) directly within the codebase-first approach, eliminating the need for step 2.
:::

## Prisma (Not Available Yet)

Prisma is another ORM you can use with Zap.ts, but it’s not available yet. We’re working on adding support for it! When it’s ready, you’ll be able to choose Prisma when you run `bun run zap:init`. Prisma is great if you like a more visual way to manage your database schema, and it has a nice query builder.

For now, we recommend using Drizzle. Check back later for updates on Prisma support!

## Core Schema (ORM-Agnostic)

Zap.ts comes with a core schema that works with any ORM. This schema is used for user authentication and is generated by the `better-auth` package, which is a core part of Zap.ts. The schema includes tables for users, sessions, accounts, and more.

Here’s what the core schema looks like in Drizzle (but the idea is the same for any ORM):

### User Table

Stores information about users, like their name, email, and role.

```typescript
// src/db/schema/auth.ts
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  twoFactorEnabled: boolean("two_factor_enabled"),
  username: text("username").unique(),
  displayUsername: text("display_username"),
  isAnonymous: boolean("is_anonymous"),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});
```

- `id`: A unique ID for each user.
- `email`: The user’s email, which must be unique.
- `role`: The user’s role (e.g., "admin" or "user").
- `banned`: Whether the user is banned.

### Session Table

Keeps track of user sessions (when they log in).

```typescript
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
  activeOrganizationId: text("active_organization_id"),
});
```

- `token`: A unique token for the session.
- `userId`: Links to the `user` table (if the user is deleted, their sessions are deleted too).
- `expiresAt`: When the session expires.

### Account Table

Stores info about external accounts (e.g., if a user logs in with Google).

```typescript
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
```

- `providerId`: The provider (e.g., "google").
- `accessToken`: The token for accessing the provider’s API.

### Other Tables

The schema also includes tables for:

- **Verification**: For email verification codes.
- **Two-Factor**: For two-factor authentication secrets.
- **Passkey**: For passkey authentication.
- **Organization**: For managing organizations (if you use teams).
- **Member**: For organization members.
- **Invitation**: For inviting users to organizations.

You can find all these tables in `src/db/schema/auth.ts` or by reading [Better Auth](https://www.better-auth.com/docs/introduction) documentation.

### PWA Notifications Table

If you enable the `pwa` plugin, there’s an extra table for push notifications:

```typescript
// src/db/schema/notifications.ts
export const pushNotifications = pgTable("push_notifications", {
  id: text("uuid").primaryKey().default("gen_random_uuid()"),
  subscription: text("jsonb").$type<webpush.PushSubscription>().notNull(),
  userId: text("uuid").references(() => user.id, { onDelete: "cascade" }),
});
```

- `subscription`: Stores the push notification subscription data.
- `userId`: Links to the `user` table.

## Next Steps

Now that your database is set up, you can:

- Run `bun run db:push` to create your tables in the database.
- Start building your app with Zap.ts!
- If you need help, check the [Drizzle docs](https://orm.drizzle.team/docs/overview) or ask on [X](https://www.x.com/alexandretrotel/).

Happy coding! ⚡
