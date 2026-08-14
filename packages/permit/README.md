# @zap-studio/permit

A type-safe, declarative authorization library for TypeScript with [Standard Schema](https://standardschema.dev/) support.

Full documentation: [zapstudio.dev/permit](https://www.zapstudio.dev/permit)

## Features

- **Full type safety** — actions, resources, and permissions are inferred from your schemas and `satisfies` declarations.
- **Standard Schema support** via `Resources` — works with Zod, Valibot, ArkType, or any compatible library.
- **Declarative policies** through `createPolicy(...)` with `allow()`, `deny()`, and `when(condition)`.
- **Role hierarchy support** via `hasRole(role, hierarchy?)`, with inheritance resolved by `collectInheritedRoles`.
- **Composable conditions** via `and`, `or`, and `not`.
- **Policy merging strategies** via `mergePoliciesEvery` and `mergePoliciesSome`.
- **Structured errors** with `PolicyError` for invalid configuration or evaluation failures.

## Quick Start

```ts
import { z } from "zod";
import { createPolicy, allow, deny, when } from "@zap-studio/permit";
import type { Resources, Actions } from "@zap-studio/permit";

const resources = {
  post: z.object({ id: z.string(), authorId: z.string() }),
} satisfies Resources;

const actions = {
  post: ["read", "write", "delete"],
} as const satisfies Actions<typeof resources>;

type AppContext = { user: { id: string } };

const policy = createPolicy<AppContext>({
  resources,
  actions,
  rules: {
    post: {
      read: allow(),
      write: when((ctx, action, resource) => ctx.user.id === resource.authorId),
      delete: deny(),
    },
  },
});

const ctx: AppContext = { user: { id: "user-1" } };
const post = { id: "1", authorId: "user-1" };

await policy.can(ctx, "post:write", post); // true, inferred as boolean
```

## Declarative Policies

Through `createPolicy(...)` with `allow()`, `deny()`, and `when(condition)`.

```ts
rules: {
  post: {
    read: allow(),
    delete: deny(),
    write: when((ctx, action, resource) => ctx.user.id === resource.authorId),
  },
}
```

## Role Hierarchy Support

Via `hasRole(role, hierarchy?)`, with inheritance resolved by `collectInheritedRoles`.

```ts
const hierarchy = { guest: [], user: ["guest"], admin: ["user"] };

rules: {
  post: {
    read: when(hasRole("guest", hierarchy)), // admins and users inherit guest access
  },
}
```

## Composable Conditions

Via `and`, `or`, and `not`.

```ts
const isOwnerOrAdmin = or(
  (ctx, action, resource) => ctx.user.id === resource.authorId,
  (ctx, action, resource) => ctx.user.role === "admin"
);
```

## Policy Merging Strategies

Via `mergePoliciesEvery` and `mergePoliciesSome`.

```ts
const merged = mergePoliciesEvery(basePolicy, restrictivePolicy);
```

## Standard Schema Support

Works with Zod, Valibot, ArkType, or any compatible library.

```ts
// Zod, Valibot, ArkType, or any Standard Schema-compatible library
const resources = {
  post: z.object({ id: z.string() }),
} satisfies Resources;
```

## Structured Errors

`PolicyError` for invalid configuration or evaluation failures.

```ts
import { PolicyError } from "@zap-studio/permit";

try {
  const policy = createPolicy(config);
  await policy.can(ctx, "post:read", post);
} catch (error) {
  if (error instanceof PolicyError) console.error(error.message);
}
```

## Runtime Support

| Runtime            | Minimum version                                  |
| ------------------ | ------------------------------------------------ |
| Node.js            | 18.0.0                                           |
| Bun                | 1.0.0                                            |
| Deno               | 1.42                                             |
| Cloudflare Workers | Any current release                              |
| Browsers           | Latest evergreen (Chrome, Edge, Firefox, Safari) |

The package ships standard ESM only and uses no runtime-specific APIs. Deno 1.42 is the first release that can install packages from JSR (`deno add jsr:@zap-studio/permit`).

## License

MIT
