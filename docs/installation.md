# Installation

Every package installs on its own. There is no meta-package, no shared runtime, and no setup step — install one, import it, use it.

## Install a Package

Replace `fetch` with the package you want.

```bash
# npm
npm install @zap-studio/fetch
# yarn
yarn add @zap-studio/fetch
# pnpm
pnpm add @zap-studio/fetch
# bun
bun add @zap-studio/fetch
# deno
deno add jsr:@zap-studio/fetch
```

npm, yarn, pnpm and bun install from npm. Deno installs from [JSR](https://jsr.io/@zap-studio), where every package is published in parallel under the same name and version.

The two tooling packages are dev dependencies, since they only run at lint or format time:

```bash
# npm
npm install --save-dev @zap-studio/oxlint oxlint
# pnpm
pnpm add -D @zap-studio/oxlint oxlint
```

## Peer Dependencies

A peer dependency is a package you install yourself, so you control its version. Most packages have none.

| Package                                            | Required peer                                  | Optional peer        |
| -------------------------------------------------- | ---------------------------------------------- | -------------------- |
| `env`, `logger`                                    | `@opentelemetry/api`                           | —                    |
| `fetch`, `permit`, `retry`, `webhooks`             | `@opentelemetry/api`                           | `@zap-studio/logger` |
| `oxfmt`                                            | `oxfmt`                                        | —                    |
| `oxlint`                                           | `oxlint`, `@oxlint/plugins`, `oxlint-tsgolint` | —                    |
| `react-hooks`                                      | `react`                                        | —                    |
| `cache`, `monads`, `store`, `validation`, `webmcp` | —                                              | —                    |

`@opentelemetry/api` is small and side-effect free. It stays a no-op until you register a real SDK, so installing it costs nothing until you want traces — see each package's OpenTelemetry page, such as [`fetch`](fetch/opentelemetry.md).

A schema library is not a dependency of anything, but `env`, `fetch`, `permit`, `validation` and `webhooks` validate through [Standard Schema](https://standardschema.dev), so you install the one you like: Zod, Valibot or ArkType.

```bash
npm install zod
```

## Import What You Use

Every package exports from its root, and most also expose one subpath per feature. Both forms give you the same function; the subpath is there when you want the smallest possible import graph.

```ts
import { createCache } from "@zap-studio/cache";
import { lru } from "@zap-studio/cache/lru";
```

`react-hooks` takes this the furthest: each of its 100+ hooks is its own module, so importing one never pulls in the rest.

```ts
import { useIsMobile } from "@zap-studio/react-hooks/sensors/use-is-mobile";
```

## TypeScript

TypeScript 5 or later is recommended. The packages run in plain JavaScript, but the types are the point — response shapes, permission checks and environment variables are all inferred from the schema you pass in.

Every package ships standard ESM with its own type declarations. There is no CommonJS build, so a `require()` call will not resolve them.

## Next

- [Runtimes](runtimes.md) — Minimum Node, Bun, Deno, Workers and browser versions, per package.
- [Getting Started](getting-started.md) — Make your first typed call in five minutes.
