# The Zap.ts Way

Zap.ts is built to help you create apps quickly with a clear and organized structure. This page explains the recommended way to set up your project in the `src` folder and why it works well for building modern apps.

## Project Structure

The `src` folder in Zap.ts is organized to keep your code clean, easy to find, and ready to grow. Here’s what each folder does:

- **actions**: Holds server actions for handling backend tasks, like form submissions (more on this below).
- **app**: Contains Next.js app router files, such as pages and layouts.
- **components**: Stores reusable UI components, split into `common` and `ui` subfolders:
  - **common**: General components used across the app, like a user profile card (e.g., `ProfileCard.tsx`).
  - **ui**: Components styled with shadcn/ui, focusing on design consistency (e.g., `Card.tsx`).
- **data**: Keeps static data, like JSON files, and feature flags to turn features on or off at build time without a database.
- **db**: Includes database-related code, such as Drizzle ORM schemas.
- **hooks**: Holds custom React hooks that can be shared across features.
- **lib**: Stores shared utilities, like helper functions or API clients.
- **providers**: Contains React context providers for app-wide state (but use Zustand stores when possible—see below).
- **rpc**: Manages oRPC code for type-safe API communication.
- **schemas**: Defines Drizzle ORM schemas and API validation schemas for type safety.
- **stores**: Holds Zustand stores for lightweight state management.
- **styles**: Includes global styles, such as Tailwind CSS configurations.

## Organizing Features

To make it easier to work with separate features and concerns, organize your code by creating subfolders for each feature within your folders such as `components`. For example:

```bash
components/
  common/
    ProfileCard.tsx
  ui/
    Card.tsx
  features/
    user/
      UserCard.tsx
      UserList.tsx
    post/
      PostForm.tsx
      PostView.tsx
```

This way, you can easily find and manage components related to a specific feature without cluttering the main `components` folder.

## Pages vs. Routes

In the `app` folder, there are some main folders that help with organizing your code but don't affect routes. These include:

- **api**: Holds only API endpoints (e.g., `/(api)/users.ts`)
- **pages**: Contains only pages (e.g., `/(pages)/home.tsx`)
- **public**: Accessible by everyone; contains pages or API routes not requiring authentication (e.g., `/(public)/(pages)/home.tsx`)
- **auth-only**: Protected by authentication; contains pages or API routes that require a user to be logged in (e.g., `/(auth-only)/(api)/user/update-account.ts`)

These folders help you group related code and make it easier to find what you need.

:::tip
A route in Next.js can be either an API endpoint or a page that can be accessed directly by the user.

- **API Route**: An API route is a server-side function that handles HTTP requests and returns data. It's usually prefixed with `/api/` (e.g., `/api/users`) and is used to interact with your application through APIs.
- **Page**: A page, on the other hand, is a React component that can be rendered on the client-side or the server-side by Next.js. Pages can have dynamic routes (e.g., `/users/[id]`) as well as API routes for handling parameterized URLs.
  :::

## Components Subfolders

The `components` folder splits into `common` and `ui` to organize your UI code:

- **common**: For general components that don’t rely on specific styling libraries. Example: a `ProfileCard.tsx` that you style manually.
- **ui**: For components built with shadcn/ui, ensuring consistent design. Example: a `Card.tsx` using shadcn/ui’s styles.

This split keeps your components organized and makes it clear which ones follow shadcn/ui’s design system.

## Server Actions vs. API Routes

**Server Actions** and **API Routes** both handle backend logic, but they work differently:

- **Server Actions**: Server-side functions for tasks like form submissions. They run on the server and are good for one-off operations. They don’t need a separate endpoint.
- **API Routes**: Next.js endpoints (e.g., `/api/users`) for reusable APIs. They’re better for parallel requests and external access. With oRPC, they become type-safe.
- **Parallelism**: API routes can handle multiple requests at once, ideal for fetching data. Actions are sequential, better for single tasks like updates.

## The Data Folder

The `data` folder holds static data and feature flags, so you don’t need a database for everything. Feature flags let you turn features on or off at build time.

### Example: Feature Flags

In `data/settings.ts`:

```typescript
export const FEATURE_FLAGS = {
  enablePushNotifications: false,
  showNewDashboard: true,
};
```

In a component:

```typescript
import { FEATURE_FLAGS } from "@/data/feature-flags";

function Dashboard() {
  if (!FEATURE_FLAGS.showNewDashboard) {
    return <div>Old Dashboard</div>;
  }
  return <div>New Dashboard</div>;
}
```

This lets you control features without changing code or using a database.

## Providers vs. Zustand Stores

The `providers` folder is for React context providers, but we recommend using Zustand stores for state management whenever possible.

::: tip
Use `providers` only when you have no other choice (e.g., for third-party libraries requiring context). For app state, use Zustand stores in the `stores` folder—they’re lighter and easier to manage.
:::

Example Zustand store (in `stores/user.store.ts`):

```typescript
"use client";

import { create } from "zustand";

export const useUserStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

## Type-Safe APIs

The `schemas` folder defines schemas for Drizzle ORM and API validation. With oRPC, you can use these schemas to ensure type safety and infer types for better app-wide type management.

### Example: Type-Safe API

In `schemas/user.schema.ts`:

```typescript
import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export type User = z.infer<typeof UserSchema>;
```

In `rpc/user.rpc.ts`:

```typescript
import { procedure, router } from "@orpc/server";
import { UserSchema } from "@/schemas/user.schema";

export const userRouter = router({
  getUser: procedure
    .input(z.object({ id: z.string() }))
    .output(UserSchema)
    .query(async ({ input }) => {
      return { id: input.id, name: "Alex", email: "alex@example.com" };
    }),
});
```

This ensures the API response matches the `User` type, and your IDE will catch type errors early.

## Naming Files

Follow these naming rules for clarity:

- For hooks: Use `use-hook.ts` (e.g., `use-user-profile.ts`).
- For components: Use `feature-name.tsx` (e.g., `user-card.tsx`).
- For stores: Use `your-store.store.ts` (e.g., `user.store.ts`).
- For server actions: Use `your-action.action.ts` (e.g., `update-user.action.ts`).
- For database schema: Use `your-schema.sql.ts` (e.g. `auth.sql.ts`).
- For Zod schemas: Use `your-schema.schema.ts` (e.g., `user.schema.ts`) and prefer PascalCase for schema names (e.g., `UserSchema` over `userSchema`).
- For RPC procedures: Use `your-procedure.rpc.ts` (e.g., `user.rpc.ts`).
- For constants in the `data` folder: Use uppercase syntax like `FLAGS` or `BASE_URL` (e.g., `export const FLAGS = { ... }`).
- Otherwise, follow React naming rules (e.g., PascalCase for components).

## Navigate Easily with Your IDE

It may sound cliché, but take advantage of your IDE’s search function to navigate between files quickly.

::: tip
In VSCode, hold `CMD` (or `Ctrl` on Windows) and left-click a file name (e.g., `use-user-profile.ts`) to open it quickly.
:::

## Why This Structure?

This setup makes building apps faster and easier:

- **Find Things Quickly**: Folders keep code organized.
- **Grow Without Mess**: Add new features without cluttering the project.
- **Work Together Better**: Teams can focus on their own features without conflicts.
- **Build Faster**: Pre-organized folders mean less setup time.

Follow this structure to get the most out of Zap.ts—happy coding!
