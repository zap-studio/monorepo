# Zap Studio Documentation

Type-safe, framework-agnostic, composable, and tree-shakeable TypeScript libraries for the web.

## Guides

- [Getting Started](getting-started.md) — install a package and make your first typed call
- [Installation](installation.md) — npm and JSR, peer dependencies, subpath imports
- [Runtimes](runtimes.md) — Node, Bun, Deno, Workers and browser support, per package
- [Composition](composition.md) — stack several packages on one request
- [Principles](principles.md) — the rules every package follows

## Packages

- [`@zap-studio/cache`](cache/README.md) — in-memory key-value cache with pluggable eviction (LRU, LFU, FIFO), a capacity limit, and optional TTL
- [`@zap-studio/env`](env/README.md) — validate and type environment variables against a Standard Schema, with a server/client/shared split and platform presets
- [`@zap-studio/fetch`](fetch/README.md) — fetch wrapper that validates JSON responses at runtime against a Standard Schema
- [`@zap-studio/logger`](logger/README.md) — lean logging abstraction for Node, Bun, Deno, browsers, and Cloudflare Workers
- [`@zap-studio/monads`](monads/README.md) — Result/Option types for explicit, type-safe error handling
- [`@zap-studio/oxfmt`](oxfmt/README.md) — oxfmt preset for import order, `package.json` sorting, and optional Tailwind class sorting
- [`@zap-studio/oxlint`](oxlint/README.md) — exclusive, single-owner oxlint rule presets
- [`@zap-studio/permit`](permit/README.md) — declarative, type-safe authorization (RBAC, conditions, policy merging) backed by Standard Schema
- [`@zap-studio/react-hooks`](react-hooks/README.md) — small, focused React hooks, one per subpath
- [`@zap-studio/retry`](retry/README.md) — composable retry policies (fixed delay, linear/exponential backoff, jitter) with cancellation
- [`@zap-studio/store`](store/README.md) — small state container with auto-tracked derived values and optional persist ([React bindings](store/react.md))
- [`@zap-studio/validation`](validation/README.md) — shared Standard Schema utilities and a consistent `ValidationError`
- [`@zap-studio/webhooks`](webhooks/README.md) — type-safe webhook router with signature verification and lifecycle hooks
- [`@zap-studio/webmcp`](webmcp/README.md) — SSR-safe tool registration for the native WebMCP `document.modelContext` API ([React bindings](webmcp/react.md))
