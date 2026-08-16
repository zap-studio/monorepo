# @zap-studio/permit

A type-safe, declarative authorization library for TypeScript with [Standard Schema](https://standardschema.dev/) support.

Full documentation: [zapstudio.dev/permit](https://www.zapstudio.dev/permit)

## Installation

```bash
npm install @zap-studio/permit
```

You also need a schema library that implements [Standard Schema](https://standardschema.dev/), such as Zod, Valibot, or ArkType.

## Features

- **Full type safety** — actions, resources, and permissions are inferred from your schemas and `satisfies` declarations.
- **Standard Schema support** via `Resources` — works with Zod, Valibot, ArkType, or any compatible library.
- **Declarative policies** through `createPolicy(...)` with `allow()`, `deny()`, and `when(condition)`.
- **Role hierarchy support** via `hasRole(role, hierarchy?)`, with inheritance resolved by `collectInheritedRoles`.
- **Composable conditions** via `and`, `or`, and `not`.
- **Policy merging strategies** via `mergePoliciesAnd` and `mergePoliciesOr`.
- **Structured errors** with `PolicyError` for invalid configuration or evaluation failures.
- **Optional logging** through `createPolicy({ logger })` ([`@zap-studio/logger`](https://www.npmjs.com/package/@zap-studio/logger)) — omit it and there's zero added logging overhead.
- **Tree-shakeable** — policies and conditions are plain functions; unused exports are dropped by any modern bundler.

## Quick Start

```ts
import { z } from "zod";
import { ConsoleLogger } from "@zap-studio/logger";
import { createPolicy, allow, deny, when } from "@zap-studio/permit";
import type { Resources, Actions } from "@zap-studio/permit";

const resources = {
  post: z.object({ id: z.string(), authorId: z.string() }),
} satisfies Resources;

const actions = {
  post: ["read", "write", "delete"],
} as const satisfies Actions<typeof resources>;

type AppContext = { user: { id: string } };

const logger = new ConsoleLogger({ minLevel: "debug" });

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
  logger,
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

Via `mergePoliciesAnd` and `mergePoliciesOr`.

```ts
const merged = mergePoliciesAnd(basePolicy, restrictivePolicy);
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

## Logging

Pass a `logger?: Logger` from [`@zap-studio/logger`](https://www.npmjs.com/package/@zap-studio/logger) to `createPolicy(...)` to observe allow/deny decisions. Omit it and only the pre-existing internal-error warnings still print, unchanged.

```ts
import { ConsoleLogger } from "@zap-studio/logger";
import { createPolicy } from "@zap-studio/permit";

const logger = new ConsoleLogger({ minLevel: "debug" });
const policy = createPolicy({ resources, actions, rules, logger });
```

Allow decisions log at `debug`, deny decisions log at `info`. Resource validation and policy evaluation errors log at `warn` through the logger when one is provided, instead of `console.warn`.

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
