# @zap-studio/permit

Authorization logic often ends up scattered across your codebase—buried in route handlers, middleware, and components.

This makes it hard to maintain, test, and audit. Every application needs to answer one question: **"Can this user do this action on this resource?"**

Most developers handle this with scattered `if` statements—checking roles in route handlers, ownership in services, and permissions in components. This approach creates problems:

- **Duplicated logic** — The same checks written in multiple places
- **Hard to audit** — No single source of truth for "who can do what"
- **Easy to forget** — New endpoints might miss authorization entirely
- **Difficult to test** — Authorization is tangled with business logic

`@zap-studio/permit` solves this by letting you define all your authorization rules in one place, with full type safety and composable building blocks.

## Why @zap-studio/permit?

**Before:**

```typescript
// Authorization logic scattered everywhere
app.delete("/posts/:id", async (req, res) => {
  const post = await getPost(req.params.id);
  const user = req.user;

  // 😱 Logic duplicated across routes
  if (user.role !== "admin" && post.authorId !== user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  await deletePost(post.id);
  res.json({ success: true });
});
```

**After:**

```typescript
import { createPolicy, when, or, hasRole } from "@zap-studio/permit";

// ✨ Centralized, declarative authorization
const policy = createPolicy<AppContext>({
  resources,
  actions,
  rules: {
    post: {
      delete: when(
        or(
          hasRole("admin"),
          (ctx, _, post) => ctx.user.id === post.authorId
        )
      ),
    },
  },
});

// Clean route handler
app.delete("/posts/:id", async (req, res) => {
  const post = await getPost(req.params.id);

  if (!policy.can(req.context, "delete", "post", post)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  await deletePost(post.id);
  res.json({ success: true });
});
```

## Features

- **Declarative policies** — Define authorization rules in one place
- **Type-safe** — Full TypeScript inference for resources, actions, and context
- **Standard Schema validation** — Validates resources at runtime using your schemas
- **Composable conditions** — Build complex rules with `and()`, `or()`, `not()`
- **Role hierarchies** — Support inherited permissions with `hasRole()`
- **Policy merging** — Combine multiple policies with different strategies
- **Framework agnostic** — Works with Express, Hono, Elysia, Fastify, Next.js, TanStack Start or any framework

## Installation

```bash
pnpm add @zap-studio/permit
# or
npm install @zap-studio/permit
```

## Quick Start

Let's build authorization for a simple blog where users can read public posts, but only authors can edit their own posts.

### 1. Define Your Resources

First, define the shape of your resources using any Standard Schema library. You can re-use existing schemas or create new ones.

```typescript
import { z } from "zod";
import type { Resources, Actions } from "@zap-studio/permit/types";

const resources = {
  post: z.object({
    id: z.string(),
    authorId: z.string(),
    visibility: z.enum(["public", "private"]),
  }),
} satisfies Resources;

const actions = {
  post: ["read", "write", "delete"],
} as const satisfies Actions<typeof resources>;
```

For instance, in the above example, we define a `post` resource that includes an `id`, `authorId`, and `visibility`.

The associated actions for this resource are `read`, `write`, or `delete`. Indeed, all resources should be defined with a set of actions that are relevant to the resource.

### 2. Create Your Policy

Then, we can define the authorization rules for each resource and action. For that, we need to provide a `context` object that contains information about the current user and their role.

```typescript
import { createPolicy, allow, when, or } from "@zap-studio/permit";

type AppContext = {
  user: { id: string; role: "guest" | "user" | "admin" } | null;
};

const policy = createPolicy<AppContext>({
  resources,
  actions,
  rules: {
    post: {
      // Anyone can read public posts, authors can read their private posts
      read: when(
        or(
          (_ctx, _action, post) => post.visibility === "public",
          (ctx, _action, post) => ctx.user?.id === post.authorId
        )
      ),
      // Only authors can write their posts
      write: when((ctx, _, post) => ctx.user?.id === post.authorId),
      // Only authors can delete their posts
      delete: when((ctx, _, post) => ctx.user?.id === post.authorId),
    },
  },
});
```

The above policy defines the authorization rules for the `post` resource. It allows anyone to read public posts and authors to read their private posts. Only authors can write or delete their posts.

### 3. Check Permissions

Finally, you can use `policy.can()` to check if an action is allowed:

```typescript
const post = {
  id: "post-1",
  authorId: "user-123",
  visibility: "public" as const,
};

const context: AppContext = {
  user: { id: "user-456", role: "user" },
};

// Check if the user can read this post
if (policy.can(context, "read", "post", post)) {
  console.log("Access granted!");
} else {
  console.log("Access denied.");
}
```

Using this approach, you get an awesome way to manage access control in your application. Everything is type-safe, easy to understand and centralized.

## What's Next?

- [Creating Policies](/packages/permit/creating-policies) — Learn about resources, actions, and policy creation
- [Policy Rules](/packages/permit/policy-rules) — Master `allow()`, `deny()`, and `when()`
- [Conditions](/packages/permit/conditions) — Build complex rules with combinators
- [Role-Based Access Control](/packages/permit/roles) — Implement role hierarchies
- [Merging Policies](/packages/permit/merging-policies) — Compose multiple policies
- [Error Handling](/packages/permit/errors) — Handle policy errors gracefully
