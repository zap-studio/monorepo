# @zap-studio/fetch

A small fetch wrapper with [**Standard Schema**](https://standardschema.dev/schema) response validation.

Full documentation: [docs/fetch](https://github.com/zap-studio/monorepo/tree/main/docs/fetch)

## Installation

```bash
npm install @zap-studio/fetch
```

You also need a schema library that implements [Standard Schema](https://standardschema.dev/schema), such as Zod, Valibot, or ArkType.

## Quick Start

```ts
import { createFetch } from "@zap-studio/fetch";
import { ConsoleLogger } from "@zap-studio/logger";
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
});

const logger = new ConsoleLogger({ minLevel: "debug" });
const { api } = createFetch({ logger });

const user = await api.get("https://api.example.com/users/1", UserSchema);

console.log(user.name); // typed as string, validated at runtime
```

## Runtime Support

| Runtime            | Minimum version                                  |
| ------------------ | ------------------------------------------------ |
| Node.js            | 18.0.0 (ships native `fetch`)                    |
| Bun                | 1.0.0                                            |
| Deno               | 1.42                                             |
| Cloudflare Workers | Any current release                              |
| Browsers           | Latest evergreen (Chrome, Edge, Firefox, Safari) |

The package relies on the global `fetch` API and ships standard ESM only. Deno 1.42 is the first release that can install packages from JSR (`deno add jsr:@zap-studio/fetch`).

## License

MIT
