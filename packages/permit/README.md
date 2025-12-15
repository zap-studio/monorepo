# @zap-studio/permit

A type-safe, declarative authorization library for TypeScript with [Standard Schema](https://standardschema.dev/) support.

## Features

- Full type safety with TypeScript
- Standard Schema support (Zod, Valibot, ArkType, etc.)
- Declarative policy definitions
- Role hierarchy support
- Composable conditions (`and`, `or`, `not`)
- Policy merging strategies

## Installation

```bash
pnpm add @zap-studio/permit
# or
npm install @zap-studio/permit
```

## Quick Start

```ts
import { z } from "zod";
import { createPolicy, allow, deny, when } from "@zap-studio/permit";
import type { Resources, Actions } from "@zap-studio/permit/types";

// 1. Define your resource schemas
const resources = {
  post: z.object({
    id: z.string(),
    authorId: z.string(),
    visibility: z.enum(["public", "private"]),
  }),
  comment: z.object({
    id: z.string(),
    postId: z.string(),
    authorId: z.string(),
  }),
} satisfies Resources;

// 2. Define actions per resource
const actions = {
  post: ["read", "write", "delete"],
  comment: ["read", "write"],
} as const satisfies Actions<typeof resources>;

// 3. Define your context type
type AppContext = {
  user: { id: string; role: "guest" | "user" | "admin" };
};

// 4. Create your policy
const policy = createPolicy<AppContext>({
  resources,
  actions,
  rules: {
    post: {
      read: when((ctx, action, resource) => resource.visibility === "public"),
      write: when((ctx, action, resource) => ctx.user.id === resource.authorId),
      delete: deny(),
    },
    comment: {
      read: allow(),
      write: when((ctx, action, resource) => ctx.user.id === resource.authorId),
    },
  },
});

// 5. Check permissions
const ctx: AppContext = { user: { id: "user-1", role: "user" } };
const post = { id: "1", authorId: "user-1", visibility: "public" as const };

policy.can(ctx, "read", "post", post); // true
policy.can(ctx, "write", "post", post); // true (user is author)
policy.can(ctx, "delete", "post", post); // false (always denied)
```

## API Reference

### Policy Builders

#### `allow()`

Returns a policy function that always allows the action.

```ts
rules: {
  post: {
    read: allow(), // Anyone can read
  },
}
```

#### `deny()`

Returns a policy function that always denies the action.

```ts
rules: {
  post: {
    delete: deny(), // No one can delete
  },
}
```

#### `when(condition)`

Returns a policy function that allows or denies based on a condition.

```ts
rules: {
  post: {
    write: when((ctx, action, resource) => ctx.user.id === resource.authorId),
  },
}
```

### Condition Combinators

#### `and(...conditions)`

Returns a condition that is true only if all conditions are true.

```ts
const isOwnerAndPublished = and(
  (ctx, action, resource) => ctx.user.id === resource.authorId,
  (ctx, action, resource) => resource.status === "published"
);
```

#### `or(...conditions)`

Returns a condition that is true if any condition is true.

```ts
const isOwnerOrAdmin = or(
  (ctx, action, resource) => ctx.user.id === resource.authorId,
  (ctx, action, resource) => ctx.user.role === "admin"
);
```

#### `not(condition)`

Returns a condition that negates another condition.

```ts
const isNotOwner = not((ctx, action, resource) => ctx.user.id === resource.authorId);
```

### Context Helpers

#### `has(key, value)`

Checks if a context property equals a specific value.

```ts
rules: {
  post: {
    write: when(has("role", "admin")),
  },
}
```

#### `hasRole(role, hierarchy?)`

Checks if the user has a specific role, with optional hierarchy support.

```ts
const hierarchy = {
  guest: [],
  user: ["guest"],
  admin: ["user"],
};

rules: {
  post: {
    read: when(hasRole("guest", hierarchy)), // Admins and users inherit guest permissions
  },
}
```

### Policy Merging

#### `mergePolicies(...policies)`

Merges policies with "deny-overrides" strategy. All policies must allow for the action to be permitted.

```ts
const merged = mergePolicies(basePolicy, restrictivePolicy);
```

#### `mergePoliciesAny(...policies)`

Merges policies with "allow-overrides" strategy. Any policy allowing is sufficient.

```ts
const merged = mergePoliciesAny(guestPolicy, memberPolicy);
```

## Type Helpers

### `Resources`

Type helper for defining resource schemas with `satisfies`.

```ts
const resources = {
  post: z.object({ id: z.string() }),
} satisfies Resources;
```

### `Actions<TResources>`

Type helper for defining actions with `satisfies`. Ensures action keys match resource keys.

```ts
const actions = {
  post: ["read", "write"],
} as const satisfies Actions<typeof resources>;
```

### `InferResource<TResources, K>`

Infers the TypeScript type for a specific resource.

```ts
type Post = InferResource<typeof resources, "post">;
// { id: string }
```

### `InferAction<TActions, K>`

Infers the action union type for a specific resource.

```ts
type PostAction = InferAction<typeof actions, "post">;
// "read" | "write"
```

## Standard Schema Support

This library uses [Standard Schema](https://standardschema.dev/) for resource validation, which means it works with any compatible schema library:

- [Zod](https://zod.dev/)
- [Valibot](https://valibot.dev/)
- [ArkType](https://arktype.io/)

```ts
// With Zod
import { z } from "zod";
const resources = {
  post: z.object({ id: z.string() }),
} satisfies Resources;

// With Valibot
import * as v from "valibot";
const resources = {
  post: v.object({ id: v.string() }),
} satisfies Resources;

// With ArkType
import { type } from "arktype";
const resources = {
  post: type({ id: "string" }),
} satisfies Resources;
```
