# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1]

### Fixed

The `@opentelemetry/api` peer dependency was published as the raw pnpm `catalog:` protocol string instead of a resolved version range, an invalid semver range. This release republishes with it resolved.

## [2.0.0]

### Added

Native OpenTelemetry support. Every `handle(request)` call now gets a `SERVER` delivery span. It reads the sender's `traceparent` header, so the delivery continues their trace instead of starting a new one. Each handler dispatch gets its own child `INTERNAL` span. A non-2xx response marks the delivery span `ERROR`. A thrown handler error is also recorded as an exception on the handler span. See [OpenTelemetry](https://www.zapstudio.dev/webhooks/opentelemetry).

### Changed

**Breaking:** `@opentelemetry/api` is now a required peer dependency. It is small, has no side effects, and does nothing until an app registers a real SDK. So nothing changes at runtime if you don't set one up. But the package will not resolve unless it is installed: `npm install @opentelemetry/api`.

## [1.1.1]

### Changed

`@zap-studio/logger` is now an optional peer dependency, not a regular one. Every import from it is type-only (`import type { Logger }`), so it was never loaded at runtime anyway. You can pass any object with the `Logger` shape (`pino` included) with no install needed. This does not affect existing use of `logger?: Logger`.

## [1.1.0]

### Added

`WebhookRouter` (and `createWebhookRouter(...)`) now take an optional `logger?: Logger` option, from `@zap-studio/logger`. When you pass one, it logs each delivery attempt and handler dispatch at `debug`, and logs verification failures and unmatched routes at `warn`. Leave it out, and there is no logging cost at all. See [Logging](https://www.zapstudio.dev/webhooks/logging).

## [1.0.0]

### Changed

`WebhookRouter`'s stateless private static methods — `runBeforeHooks`, `runAfterHooks`, `createHandlerEntry`, `parseRequestBody`, `validatePayload`, `executeHandler` — are now plain functions at the module level in `router.ts`. This is internal only. The public API (`WebhookRouter`, `createWebhookRouter`, `.register()`, `.handle()`) does not change.

HMAC signature verification now decodes the header's hex signature into bytes, and compares it to the computed digest byte by byte. Before, it turned the digest into hex text and compared that text instead. Behavior stays the same for valid requests. This only changes internals: fewer bytes get compared, and the header's hex case no longer needs normalizing as text, since decoding handles the case on its own.

`constantTimeEquals` moved from `utils.ts` to `verify.ts`, its only user, and now compares `Uint8Array`s (bytes) instead of strings. It is still exported from `@zap-studio/webhooks` and `@zap-studio/webhooks/verify`.

### Removed

Removed the `./utils` subpath export.

## [0.4.0]

### Changed

The custom `NormalizedRequest`/`NormalizedResponse` contract is gone. `router.handle` now takes a standard Web API `Request` and returns a standard `Response`. So the router works directly with fetch-native runtimes — Bun, Deno, Cloudflare Workers, Next.js route handlers, Hono — with no adapter layer needed.

**Breaking changes:**

- `handle(req: NormalizedRequest): Promise<NormalizedResponse>` → `handle(request: Request): Promise<Response>`.
- Handlers now get `{ request, rawBody, path, payload }` — a `WebhookContext` plus the validated `payload` — and return a `Response`, or `undefined` for the default `200 "ok"`. The `ack` helper is removed. Use `Response.json(body, init)` instead.
- Hooks and `verify` now use the context type: `BeforeHook(ctx)`, `AfterHook(ctx, response)`, `ErrorHook(error, ctx)`, `VerifyFn(ctx)`. An after hook must call `clone()` on the response before it reads the body.
- `Adapter`, `BaseAdapter`, and the `./adapters/base` export are removed. If you use Node's `http`, bridge with `srvx` or `@hono/node-server`.
- The prefix now always gets a trailing slash, and only matches at a path boundary. `prefix: "/api"` now behaves like `/api/`. So `/apihello` no longer matches a route — before this fix, it matched the route `ihello`.

Kept the same: hook order, how the prefix works (default `/webhooks/`), exact-match routing, HMAC verification, and the `404`/`400`/`500` error body shapes. One change: an unknown route now returns `404` without reading the request body.

## [0.3.0]

### Changed

`Adapter` and `BaseAdapter` are now generic over the framework's request/response types: `Adapter<TReq, TRes>`, `BaseAdapter<TReq, TRes>`. This replaces the old per-method generics. The mapping members — `toNormalizedRequest`, `toFrameworkResponse`, `handleWebhook` — are now arrow properties. So a custom adapter must now override them as properties, not as methods.

Also: `register()` now returns `this`. Error hooks always get a real `Error` instance. `rawBody` is now typed as `Uint8Array`. Internal formatting and lint cleanup moved to ultracite.

## [0.2.2]

### Changed

- Updated dependency `@zap-studio/validation` to `0.3.4`.

## [0.2.1]

### Changed

- 5fa58b1: Made the webhook router simpler. Hook normalization and handler entry creation are now combined.
- 7004e9f: Option handling now allows explicit `undefined`. d707800 then removed extra `| undefined` unions from public types that this made redundant.
- 9f31f87: Switched the package build to ESNext-aligned output, and updated package tooling and publish metadata.
- Updated dependency `@zap-studio/validation` to `0.3.3`.

### Fixed

- 3a950dc: Kept the types of registered hook assignments correct, with no change to the schema-first router API.

## [0.2.0]

### Changed

- c686862: Switched `createHmacVerifier` to Web Crypto, and made all verifiers use string secrets.

  This removes the Node `crypto` dependency from the verifier path. `req.rawBody` stays a `Uint8Array`. `createHmacVerifier` is now simpler: it takes a string secret. It also adds a public `VerificationError` in `@zap-studio/webhooks/errors`, for verifier setup and signature failures.

## [0.1.4]

### Changed

- e26293e: Updated dependencies.
  - @zap-studio/validation@0.3.2

## [0.1.3]

### Changed

- 5ea3d3b: Updated dependencies.
  - @zap-studio/validation@0.3.1

## [0.1.2]

### Fixed

- c209a27: Fixed payload schema validation internals to use the current async `standardValidate` options API (`{ throwOnError: false }`). This restores typecheck compatibility after a signature update to the validation helper.

## [0.1.1]

### Changed

- f75b984: Updated dependency `@zap-studio/validation` to `0.3.0`.

## [0.1.0]

### Added

- 0d6254c: Initial public release of `@zap-studio/webhooks`.
  - Schema-first webhook router with inferred payload types.
  - Request verification support, including `createHmacVerifier`.
  - Lifecycle hooks (`before`, `after`, `onError`) for cross-cutting concerns.
  - Framework-agnostic adapter contracts via `Adapter` and `BaseAdapter`.
  - Comprehensive test coverage and documentation.
