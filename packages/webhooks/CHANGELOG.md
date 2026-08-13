## @zap-studio/webhooks@0.5.0

### Reduced module surface (breaking)

`constantTimeEquals` moved into `verify.ts` (its only consumer) and is no longer part of the public API.

- Removed the `./utils` subpath export.
- Removed the public `constantTimeEquals` export from `@zap-studio/webhooks` — it was an implementation detail of `createHmacVerifier`, not a standalone utility.

### `createHmacVerifier` now compares raw signature bytes

HMAC signature verification decodes the incoming header's hex signature to bytes and compares it against the computed digest byte-for-byte, instead of hex-encoding the digest and comparing hex text. Behavior is unchanged for valid requests; this only affects internals (fewer bytes compared, and the header's hex is no longer case-normalized as text since decoding handles case natively).

## @zap-studio/webhooks@0.4.0

### Rework the package on Web API `Request`/`Response` (breaking)

The custom `NormalizedRequest`/`NormalizedResponse` contract is gone. `router.handle` now takes a standard Web API `Request` and returns a standard `Response`, so the router plugs directly into fetch-native runtimes (Bun, Deno, Cloudflare Workers, Next.js route handlers, Hono) with no adapter layer.

Breaking changes:

- `handle(req: NormalizedRequest): Promise<NormalizedResponse>` → `handle(request: Request): Promise<Response>`.
- Handlers receive `{ request, rawBody, path, payload }` (a `WebhookContext` plus the validated `payload`) and return a `Response` or `undefined` (default `200` `"ok"`). The `ack` helper is removed — use `Response.json(body, init)`.
- Hooks and `verify` are retyped against the context: `BeforeHook(ctx)`, `AfterHook(ctx, response)`, `ErrorHook(error, ctx)`, `VerifyFn(ctx)`. After hooks must `clone()` the response before reading its body.
- `Adapter`, `BaseAdapter`, and the `./adapters/base` export are removed. Node `http` users can bridge with `srvx` or `@hono/node-server`.
- The prefix is normalized to a trailing slash and only matches on a path boundary: `prefix: "/api"` now behaves as `/api/`, so `/apihello` no longer matches a route (previously it matched `ihello`).

Behavior kept: hook execution order, prefix semantics (default `/webhooks/`), exact-match routing, HMAC verification, and the `404`/`400`/`500` error body shapes. Unknown routes now return `404` without reading the request body.

## @zap-studio/webhooks@0.3.0

### Migrate to ultracite lint/format; make the adapter contract generic

`Adapter` and `BaseAdapter` are now generic over the framework request/response types (`Adapter<TReq, TRes>`, `BaseAdapter<TReq, TRes>`), replacing the previous per-method generics. The mapping members (`toNormalizedRequest`, `toFrameworkResponse`, `handleWebhook`) are now arrow properties, so custom adapters must override them with property syntax rather than method syntax.

Also: `register()` now returns `this`, error hooks always receive a real `Error` instance, and `rawBody` is typed as `Uint8Array`.

# @zap-studio/webhooks

## 0.2.2

### Dependencies

- Updated dependency `@zap-studio/validation` to `0.3.4`.

## 0.2.1

### Fixed

- 3a950dc: Preserve registered hook assignment types while keeping the schema-first router API unchanged.

### Changed

- 5fa58b1: Reduced webhook router complexity by consolidating hook normalization and handler entry creation.
- 7004e9f: Allow explicit `undefined` in option handling, then follow with d707800 to remove redundant `| undefined` unions from public types.
- 9f31f87: Switched the package build to ESNext-aligned output and updated package tooling and publish metadata.

### Dependencies

- Updated dependency `@zap-studio/validation` to `0.3.3`.

## 0.2.0

### Minor Changes

- c686862: Switch `createHmacVerifier` to Web Crypto and standardize the verifier around string secrets.

  This change removes the Node `crypto` dependency from the verifier path, keeps `req.rawBody` as `Uint8Array`, simplifies `createHmacVerifier` to take a string secret, and adds public `VerificationError` in `@zap-studio/webhooks/errors` for verifier setup and signature failures.

## 0.1.4

### Patch Changes

- e26293e: Updated dependencies.
  - @zap-studio/validation@0.3.2

## 0.1.3

### Patch Changes

- 5ea3d3b: Updated dependencies.
  - @zap-studio/validation@0.3.1

## 0.1.2

### Patch Changes

- c209a27: Fix payload schema validation internals to use the current async `standardValidate` options API (`{ throwOnError: false }`), restoring typecheck compatibility after the validation helper signature update.

## 0.1.1

### Dependencies

- f75b984: Updated dependency `@zap-studio/validation` to `0.3.0`.

## 0.1.0

### Added

- 0d6254c: Initial public release of `@zap-studio/webhooks`.
  - Schema-first webhook router with inferred payload types.
  - Request verification support, including `createHmacVerifier`.
  - Lifecycle hooks (`before`, `after`, `onError`) for cross-cutting concerns.
  - Framework-agnostic adapter contracts via `Adapter` and `BaseAdapter`.
  - Comprehensive test coverage and documentation.
