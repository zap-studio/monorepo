# @zap-studio/permit

A type-safe, declarative authorization library for TypeScript with [Standard Schema](https://standardschema.dev/) support.

Full documentation: [docs/permit](https://github.com/zap-studio/monorepo/tree/main/docs/permit)

## Installation

```bash
npm install @zap-studio/permit
```

You also need a schema library that implements [Standard Schema](https://standardschema.dev/), such as Zod, Valibot, or ArkType.

## Quick Start

```ts
import type { Resources, Actions } from "@zap-studio/permit";

import { ConsoleLogger } from "@zap-studio/logger";
import { createPolicy, allow, deny, when } from "@zap-studio/permit";
import { z } from "zod";

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
