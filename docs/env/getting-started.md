# Getting Started

This page walks you through installing `@zap-studio/env` and validating your first env object. For deeper details, check the other pages in this section.

## Install

```bash
# npm
npm install @zap-studio/env
# yarn
yarn add @zap-studio/env
# pnpm
pnpm add @zap-studio/env
# bun
bun add @zap-studio/env
# deno
deno add jsr:@zap-studio/env
```

You also need a schema library that implements [Standard Schema](https://standardschema.dev/), such as Zod, Valibot, or ArkType.

## Define a Schema

Split your vars into `server` (server-only) and `client` (readable everywhere, exposed to the browser). Use `shared` for vars that don't need the client/server split at all.

```ts
import { z } from "zod";

const schema = {
  server: {
    DATABASE_URL: z.string().url(),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  clientPrefix: "NEXT_PUBLIC_",
};
```

`clientPrefix` is required as soon as `client` is declared — see [`server`/`client`/`shared`](server-client-shared.md) for why.

## Validate Your Env

Call `createEnvironment(...)` with the schema and the resolved env object to validate against.

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
```

Each var is on its own line. Bundlers (webpack, Next.js, Vite) replace a literal `process.env.X` line at build time — they cannot do this with a spread of the whole object. This matters for `client` vars, since they must end up in the browser bundle. See [Advanced Options](advanced-options.md#runtimeenvstrict) for when `runtimeEnv: process.env` is fine instead.

If any declared var fails validation, `createEnvironment` throws an [`EnvironmentValidationError`](errors.md) listing every invalid key.

## Read Values

The returned `env` object is fully typed from your schemas. On the server, every declared var is readable. Off the server, reading a `server`-only key throws instead of silently returning `undefined`.

```ts
env.DATABASE_URL; // string — throws if read from a client bundle
env.NEXT_PUBLIC_API_URL; // string — readable everywhere
```

`isServer` defaults to `typeof window === "undefined"`. Set it yourself when that default is wrong, such as in some edge or SSR contexts — see [`server`/`client`/`shared`](server-client-shared.md).

## Next Steps

- [`server`/`client`/`shared`](server-client-shared.md) — the full split, `clientPrefix`, and the access guard
- [`extends`](extends.md) — reuse schemas across packages and apps
- [Presets](presets.md) — type vars your hosting platform already sets
- [`generateEnvironmentExample`](generate-env-example.md) — keep `.env.example` in sync with your schema
