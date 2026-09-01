# @zap-studio/env

A runtime and framework-agnostic env var validator, built on [Standard Schema](https://standardschema.dev/).

Full documentation: [zapstudio.dev/env](https://www.zapstudio.dev/env)

## Motivation

`@zap-studio/env` checks an env object you already have (`process.env`, `import.meta.env`, dotenv output, or anything else) against a schema. It does not read or parse files itself.

It works the same way in Node, Deno, Bun, Cloudflare Workers, edge runtimes, and the browser, and with any bundler or framework. It never scans or looks up env keys at runtime. This means it does not break the static `process.env`/`import.meta.env` replacement that bundlers use.

It uses the same `server`/`client`/`shared` split as [t3-env](https://env.t3.gg), the package most people use for this job today. A server secret cannot leak into a client bundle by accident. But t3-env still has real problems. Its `extends` does a flat merge of schemas, with no conflict check, so a key can silently get dropped or overwritten. Its presets do not cover Cloudflare Workers or Deno Deploy. And framework support needs its own packages, like `env-nextjs` and `env-nuxt`. This ties the core package to one framework.

[envin](https://envin.turbostarter.dev) already fixes some of these problems. It adds a CLI, better preset and `extends` support, and a live env preview (`@envin/cli dev`). It keeps the same `server`/`client`/`shared` shape as t3-env. So envin, not t3-env, is the real bar this package needs to clear. `@zap-studio/env` goes further than envin in two ways. Its `extends` merges schemas at the key level, not with a flat merge, and throws right away if two sources use the same key with two different schemas. And it ships presets for Cloudflare Workers and Deno Deploy, which neither t3-env nor envin do.

envin also has a live preview through a running dev server. `@zap-studio/env` takes a simpler, static approach instead: `generateEnvironmentExample(...)` builds a `.env.example` file straight from your schema. This needs no dev server, so it is safe to run in CI and commit.

## Installation

```bash
npm install @zap-studio/env
```

You also need a schema library that implements [Standard Schema](https://standardschema.dev/), such as Zod, Valibot, or ArkType.

## Features

- **Full type safety** — the parsed env object is inferred from your schemas.
- **Standard Schema support** — works with Zod, Valibot, ArkType, or any compatible library.
- **`server`/`client`/`shared` split** with `clientPrefix`, checked at both the type level and at runtime.
- **Schema composition** via `extends`, with reference-equality conflict detection.
- **Platform presets** for common hosting providers.
- **`.env.example` generation** via `generateEnvironmentExample(...)`.
- **Structured errors**: `EnvironmentError`, `EnvironmentValidationError`, and `EnvironmentAccessError`.
- **Optional OpenTelemetry support** through a single `env.validate` span — zero cost until an app registers an SDK.
- **Tree-shakeable** — `createEnvironment`, `generateEnvironmentExample`, presets, and errors are plain functions and objects.

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
  runtimeEnvironment: process.env,
});

env.DATABASE_URL; // server-only: throws if read from a client bundle
env.NEXT_PUBLIC_API_URL; // readable everywhere
```

`isServer` defaults to `typeof window === "undefined"`. Set it yourself when that default is wrong, such as in some edge or SSR contexts.

## Options

| Option                     | Purpose                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `shared`                   | Vars readable on both server and client; validated once.                                                           |
| `server`                   | Server-only vars; throws if read from the client.                                                                  |
| `client`                   | Client-exposed vars; every key must start with `clientPrefix`.                                                     |
| `clientPrefix`             | Required prefix for every `client` key.                                                                            |
| `runtimeEnvironment`       | The resolved env object to validate (`process.env`, `import.meta.env`, ...).                                       |
| `runtimeEnvironmentStrict` | Used instead of `runtimeEnvironment` when provided.                                                                |
| `extends`                  | Composes other `EnvironmentSchema` sources (see below).                                                            |
| `isServer`                 | How to detect a server context. Defaults to `typeof window === "undefined"`.                                       |
| `skipValidation`           | Skips validation and returns the declared keys as-is. Useful for partial Docker build steps.                       |
| `emptyStringAsUndefined`   | Treats `""` as `undefined` before validation.                                                                      |
| `onValidationError`        | Called with the per-key issues instead of throwing `EnvironmentValidationError`. Must throw or exit.               |
| `onInvalidAccess`          | Called when client code reads a server-only key, instead of throwing `EnvironmentAccessError`. Must throw or exit. |

## `extends`: composing schemas

`extends` reuses an `EnvironmentSchema` object. This works like `tsconfig.json`'s `extends`, which reuses a base config. A shared package exports a plain object. An app then adds it in:

```ts
// packages/db/src/env-schema.ts
import type { EnvironmentSchema } from "@zap-studio/env";
import { z } from "zod";

export const dbEnvironmentSchema = {
  server: { DATABASE_URL: z.string().url() },
} satisfies EnvironmentSchema;

// apps/api/src/env.ts
import { createEnvironment } from "@zap-studio/env";
import { dbEnvironmentSchema } from "@your-org/db";
import { z } from "zod";

export const env = createEnvironment({
  extends: [dbEnvironmentSchema],
  server: { PORT: z.coerce.number().default(3000) },
  runtimeEnvironment: process.env,
});
```

If two composed sources use the same key with two different schemas, `createEnvironment` throws an `EnvironmentError` right away. There is one exception: when both sources use the exact same schema object. This can happen when two packages import one shared constant.

## Presets

Presets cover env vars that a hosting platform sets on its own. Every key is optional and typed as a plain string, because it is only present when the app runs on that platform:

```ts
import { createEnvironment } from "@zap-studio/env";
import { vercel } from "@zap-studio/env/presets";
import { z } from "zod";

export const env = createEnvironment({
  extends: [vercel],
  server: { DATABASE_URL: z.string().url() },
  runtimeEnvironment: process.env,
});

env["VERCEL_GIT_COMMIT_SHA"]; // string | undefined
```

Available presets: `vercel`, `netlify`, `render`, `railway`, `fly`, `coolify`, `cloudflare`, `denoDeploy`.

## `.env.example` generation

`generateEnvironmentExample(...)` reads a schema and returns a `.env.example` file as a string. The schema has the same `shared`/`server`/`client`/`extends` shape as `createEnvironment`, but without the runtime-only options. It never reads any real env values, so it is safe to run in CI and commit:

```ts
import { writeFileSync } from "node:fs";
import { generateEnvironmentExample } from "@zap-studio/env";
import { z } from "zod";

writeFileSync(
  ".env.example",
  generateEnvironmentExample({
    server: { DATABASE_URL: z.string().url() },
    client: { NEXT_PUBLIC_API_URL: z.string().url() },
    clientPrefix: "NEXT_PUBLIC_",
  }),
);
```

```ini
# server, required
DATABASE_URL=

# client, required, prefix: NEXT_PUBLIC_
NEXT_PUBLIC_API_URL=
```

A key is marked optional when its schema accepts `undefined`. This is true for a field that is truly optional, and for one with a default value.

## Errors

- **`EnvironmentError`** — thrown by `createEnvironment` and `generateEnvironmentExample` for a bad setup: a missing `clientPrefix`, a `client` key that does not match it, or an `extends` conflict.
- **`EnvironmentValidationError`** — thrown by `createEnvironment` when one or more vars fail validation. It carries `invalidKeys` (never the values) and the full Standard Schema `issues` for each key.
- **`EnvironmentAccessError`** — thrown when client-side code reads a server-only key.

```ts
import { createEnvironment, EnvironmentValidationError } from "@zap-studio/env";

try {
  const env = createEnvironment({
    server: { PORT: z.coerce.number() },
    runtimeEnvironment: process.env,
  });
} catch (error) {
  if (error instanceof EnvironmentValidationError) {
    console.error("Invalid env vars:", error.invalidKeys);
  }
}
```

## OpenTelemetry

`@opentelemetry/api` is a required peer dependency. It is small, has no side effects, and does nothing until an app registers a real SDK. So it costs nothing at runtime for users who never set one up.

Each validation pass gets an `INTERNAL` span named `env.validate`. On failure, the span carries the invalid key names (never the values) and an error status:

```bash
npm install @opentelemetry/api
```

```ts
import { createEnvironment } from "@zap-studio/env";

// If your app has registered an OpenTelemetry SDK, this call now produces a
// span. If not, it does nothing. No extra setup is needed either way.
export const env = createEnvironment({
  server: { PORT: z.coerce.number() },
  runtimeEnvironment: process.env,
});
```

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
