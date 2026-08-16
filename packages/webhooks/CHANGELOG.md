# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0]

### Added

`WebhookRouter` (and `createWebhookRouter(...)`) gain an optional `logger?: Logger` option (from `@zap-studio/logger`). When provided, it logs each delivery attempt and handler dispatch at `debug`, and verification failures and unmatched routes at `warn`. Omitting it keeps zero logging overhead. See [Logging](https://www.zapstudio.dev/webhooks/logging).

## [1.0.0]

### Changed

`WebhookRouter`'s stateless private static methods (`runBeforeHooks`, `runAfterHooks`, `createHandlerEntry`, `parseRequestBody`, `validatePayload`, `executeHandler`) are now module-level functions in `router.ts`. Internal-only change; the public API (`WebhookRouter`, `createWebhookRouter`, `.register()`, `.handle()`) is unaffected.

HMAC signature verification decodes the incoming header's hex signature to bytes and compares it against the computed digest byte-for-byte, instead of hex-encoding the digest and comparing hex text. Behavior is unchanged for valid requests; this only affects internals (fewer bytes compared, and the header's hex is no longer case-normalized as text since decoding handles case natively).

`constantTimeEquals` moved from `utils.ts` into `verify.ts` (its only consumer) and now compares `Uint8Array`s (bytes) instead of strings. Still exported from `@zap-studio/webhooks` and `@zap-studio/webhooks/verify`.

### Removed

Removed the `./utils` subpath export.

## [0.4.0]

### Changed

The custom `NormalizedRequest`/`NormalizedResponse` contract is gone. `router.handle` now takes a standard Web API `Request` and returns a standard `Response`, so the router plugs directly into fetch-native runtimes (Bun, Deno, Cloudflare Workers, Next.js route handlers, Hono) with no adapter layer.

**Breaking changes:**

- `handle(req: NormalizedRequest): Promise<NormalizedResponse>` → `handle(request: Request): Promise<Response>`.
- Handlers receive `{ request, rawBody, path, payload }` (a `WebhookContext` plus the validated `payload`) and return a `Response` or `undefined` (default `200` `"ok"`). The `ack` helper is removed — use `Response.json(body, init)`.
- Hooks and `verify` are retyped against the context: `BeforeHook(ctx)`, `AfterHook(ctx, response)`, `ErrorHook(error, ctx)`, `VerifyFn(ctx)`. After hooks must `clone()` the response before reading its body.
- `Adapter`, `BaseAdapter`, and the `./adapters/base` export are removed. Node `http` users can bridge with `srvx` or `@hono/node-server`.
- The prefix is normalized to a trailing slash and only matches on a path boundary: `prefix: "/api"` now behaves as `/api/`, so `/apihello` no longer matches a route (previously it matched `ihello`).

Behavior kept: hook execution order, prefix semantics (default `/webhooks/`), exact-match routing, HMAC verification, and the `404`/`400`/`500` error body shapes. Unknown routes now return `404` without reading the request body.

## [0.3.0]

### Changed

`Adapter` and `BaseAdapter` are now generic over the framework request/response types (`Adapter<TReq, TRes>`, `BaseAdapter<TReq, TRes>`), replacing the previous per-method generics. The mapping members (`toNormalizedRequest`, `toFrameworkResponse`, `handleWebhook`) are now arrow properties, so custom adapters must override them with property syntax rather than method syntax.

Also: `register()` now returns `this`, error hooks always receive a real `Error` instance, and `rawBody` is typed as `Uint8Array`. Internal formatting and lint cleanup migrated to ultracite.

## [0.2.2]

### Changed

- Updated dependency `@zap-studio/validation` to `0.3.4`.

## [0.2.1]

### Changed

- 5fa58b1: Reduced webhook router complexity by consolidating hook normalization and handler entry creation.
- 7004e9f: Allow explicit `undefined` in option handling, then follow with d707800 to remove redundant `| undefined` unions from public types.
- 9f31f87: Switched the package build to ESNext-aligned output and updated package tooling and publish metadata.
- Updated dependency `@zap-studio/validation` to `0.3.3`.

### Fixed

- 3a950dc: Preserve registered hook assignment types while keeping the schema-first router API unchanged.

## [0.2.0]

### Changed

- c686862: Switch `createHmacVerifier` to Web Crypto and standardize the verifier around string secrets.

  This change removes the Node `crypto` dependency from the verifier path, keeps `req.rawBody` as `Uint8Array`, simplifies `createHmacVerifier` to take a string secret, and adds public `VerificationError` in `@zap-studio/webhooks/errors` for verifier setup and signature failures.

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

- c209a27: Fix payload schema validation internals to use the current async `standardValidate` options API (`{ throwOnError: false }`), restoring typecheck compatibility after the validation helper signature update.

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
