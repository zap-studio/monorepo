# @zap-studio/env

A runtime and framework-agnostic env var validator, built on [Standard Schema](https://standardschema.dev/).

Full documentation: [docs/env](https://github.com/zap-studio/monorepo/tree/main/docs/env)

## Installation

```bash
npm install @zap-studio/env
```

You also need a schema library that implements [Standard Schema](https://standardschema.dev/), such as Zod, Valibot, or ArkType.

## Quick Start

```ts
import { createEnvironment } from "@zap-studio/env";
import { z } from "zod";

export const env = createEnvironment({
  server: {
    DATABASE_URL: z.string().url(),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  clientPrefix: "NEXT_PUBLIC_",
  runtimeEnvStrict: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});

env.DATABASE_URL; // server-only: throws if read from a client bundle
env.NEXT_PUBLIC_API_URL; // readable everywhere
```

Each var is on its own line — `process.env.DATABASE_URL`, not `process.env` as a whole. Bundlers like webpack, Next.js, and Vite (`import.meta.env.X`) replace `process.env.X` at build time, and they need this exact pattern to do it. That is how `NEXT_PUBLIC_API_URL` still makes it into the client bundle. If your schema has no `client` vars, you can pass the whole object with `runtimeEnv: process.env` instead — see [`runtimeEnvStrict`](#options) below.

`isServer` defaults to `typeof window === "undefined"`. Set it yourself when that default is wrong, such as in some edge or SSR contexts.

## Runtime Support

| Runtime            | Minimum version                                  |
| ------------------ | ------------------------------------------------ |
| Node.js            | 18.0.0                                           |
| Bun                | 1.0.0                                            |
| Deno               | 1.42                                             |
| Cloudflare Workers | Any current release                              |
| Browsers           | Latest evergreen (Chrome, Edge, Firefox, Safari) |

The package ships standard ESM only and uses no runtime-specific APIs. Deno 1.42 is the first release that can install packages from JSR (`deno add jsr:@zap-studio/env`).

## License

MIT
