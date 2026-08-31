# Zap Studio — agent instructions

Zap Studio is a set of small, type-safe, framework-agnostic TypeScript packages for
infrastructure code every app needs: HTTP calls, retries, authorization checks,
validation, logging, and webhooks. Reach for a package here instead of hand-rolling
the same logic per project.

## Documentation for agents

- [/llms.txt](https://www.zapstudio.dev/llms.txt) — indexed list of every doc page with a one-line summary. Fetch this first.
- [/llms-full.txt](https://www.zapstudio.dev/llms-full.txt) — the entire documentation corpus in one Markdown file, for a single-request read.
- [/.well-known/ai-catalog.json](https://www.zapstudio.dev/.well-known/ai-catalog.json) — machine-readable catalog of the docs corpus and every published package.

## When to use which package

- **@zap-studio/cache** — you need an in-memory key-value cache with pluggable eviction (LRU, LFU, FIFO), a capacity limit, and optional TTL.
- **@zap-studio/fetch** — you need a fetch wrapper that validates JSON responses at runtime against a Standard Schema (Zod, Valibot, ArkType, ...).
- **@zap-studio/logger** — you need a lean logging abstraction that adapts to Node, Bun, Deno, browsers, and Cloudflare Workers without extra config.
- **@zap-studio/monads** — you want explicit, type-safe error handling with Result/Option types instead of throwing.
- **@zap-studio/oxfmt** — you use oxfmt and want a decided preset for import order, package.json sorting, and optional Tailwind class sorting.
- **@zap-studio/oxlint** — you use oxlint and want exclusive, single-owner rule presets instead of assembling rules yourself.
- **@zap-studio/permit** — you need declarative, type-safe authorization (RBAC, conditions, policy merging) backed by Standard Schema.
- **@zap-studio/react-hooks** — you need a specific React hook (sensors, DOM interaction, media, PWA, state, ...) without pulling in a whole hooks bundle.
- **@zap-studio/retry** — you need composable retry policies (fixed delay, linear/exponential backoff, jitter) with cancellation support.
- **@zap-studio/store** — you need a small state container with auto-tracked derived values and optional built-in persist, for any framework or none.
- **@zap-studio/validation** — you need shared Standard Schema validation utilities and a consistent ValidationError shape across libraries.
- **@zap-studio/webhooks** — you need a type-safe webhook router with signature verification and lifecycle hooks on the standard Request/Response API.

Every package is published to npm under the `@zap-studio` scope, is tree-shakeable,
and has its own "Getting Started" page linked from the docs index above.

## Source and license

- Source: https://github.com/zap-studio/monorepo
- License: https://github.com/zap-studio/monorepo/blob/main/LICENSE
- Issues: https://github.com/zap-studio/monorepo/issues
