# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.2]

### Fixed

The `@opentelemetry/api` peer dependency was published as the raw pnpm `catalog:` protocol string instead of a resolved version range, an invalid semver range. This release republishes with it resolved.

## [2.1.1]

### Changed

Reverted the `@zap-studio/monads` dependency and the `$fetchResult`/`apiResult`/`createFetch(...).​$fetchResult`/`createFetch(...).​apiResult` exports added in 2.1.0. They added a dependency and more bundle size for something you can already do yourself: wrap `$fetch`/`api` with `@zap-studio/monads`'s `fromPromise`. See the README's "Using with `@zap-studio/monads`" section. 2.1.0 is now deprecated on npm. Use this release instead.

## [2.1.0] (deprecated — see 2.1.1)

### Added

- Added `$fetchResult`/`apiResult`: versions of `$fetch`/`api` that return `Result`/`ResultAsync` instead of throwing. They use the new `@zap-studio/monads` dependency. `createFetch(...)` instances also get `$fetchResult`/`apiResult`, next to the existing `$fetch`/`api`. This is opt-in: `$fetch`, `api`, and `createFetch(...)` do not change. There is no `throwOnFetchError`/`throwOnValidationError` option here. A non-ok response and a validation issue both become `Err`. A malformed schema or request still throws.

## [2.0.0]

### Added

Native OpenTelemetry support. Every request now gets a `CLIENT` span (`http.request.method`, `url.full`, `http.response.status_code`). The trace context is added to the outgoing request's headers, so the call stays part of the caller's trace. On failure — a non-2xx response or a thrown error — the span is marked `ERROR`, and a thrown error is also recorded on the span. See [OpenTelemetry](https://www.zapstudio.dev/fetch/opentelemetry).

### Changed

**Breaking:** `@opentelemetry/api` is now a required peer dependency. It is small, has no side effects, and does nothing until an app sets up a real SDK. So nothing changes at runtime if you don't use one. But you must install it for the package to work: `npm install @opentelemetry/api`.

## [1.1.1]

### Changed

`@zap-studio/logger` is now an optional peer dependency, not a regular one. Every import from it is type-only (`import type { Logger }`), so it was never loaded at runtime. You can pass any object with the `Logger` shape (`pino` included) with no install needed. If you already use `logger?: Logger`, nothing changes for you.

## [1.1.0]

### Added

`createFetch(...)` now has an optional `logger?: Logger` option (from `@zap-studio/logger`). When you pass one, it logs outgoing requests at `debug`, the response status at `debug` (2xx) or `warn` (non-2xx), and schema validation failures at `error`. Leave it out and there is no logging cost at all. See [Logging](https://www.zapstudio.dev/fetch/logging).

## [1.0.0]

### Changed

- Clarified tree-shakeable design in the package description and README (no code change).

### Removed

Collapsed the internal request pipeline (`_internal.ts`, `_methods.ts`, `constants.ts`, `headers.ts`, `request.ts`, `url.ts`) into implementation-only files. `mergeHeaders`, `normalizeRequest`, and `resolveRequestUrl` are no longer public API. They were internal pipeline pieces, not made for standalone use.

- Removed the `./constants`, `./headers`, `./request`, `./url`, and `./fetch` subpath exports. Use the root `@zap-studio/fetch` entry instead.
- `GLOBAL_DEFAULTS`, `FetchError`, `$fetch`, `api`, `createFetch`, and all public types still work the same, still exported from `.`. The `./errors` and `./types` subpaths still work too.

## [0.5.6]

### Added

The package root now re-exports the full public API. So you can import everything straight from `@zap-studio/fetch` (`$fetch`, `api`, `createFetch`, `FetchError`, `mergeHeaders`, `GLOBAL_DEFAULTS`, `normalizeRequest`, `resolveRequestUrl`, and all public types). All exports are side-effect free and tree-shakeable. The narrower subpath imports still work too.

- The `$fetch`/`api`/`createFetch` implementation moved from the entrypoint into its own module, available as the new `./fetch` subpath.

### Removed

- Removed the `./internal` and `./methods` subpath exports. Both were implementation details (`fetchInternal`, `createMethod`) and are no longer part of the public API.

## [0.5.5]

### Changed

Internal formatting and lint cleanup only. No public API or behavior change.

## [0.5.4]

### Changed

- Added fetch ecosystem benchmarks and grouped benchmark output for easier cross-library comparisons.
- Applied small internal performance optimizations in request preparation, URL resolution, and header merging without changing public API behavior.

## [0.5.3]

### Changed

- Refactor `createFetch(...)` to derive fallback defaults from `GLOBAL_DEFAULTS` instead of re-defining primitive defaults inline.

## [0.5.2]

### Changed

- Expand TSDoc coverage across fetch modules and exported contracts for stronger JSR documentation completeness.
- Updated dependency `@zap-studio/validation` to `0.3.4`.

## [0.5.1]

### Fixed

- d92f2c2: Preserve explicit `throwOnValidationError: true` overrides in `$fetch` method helpers and factory-created fetch clients.

### Changed

- 2ea1a70: Cleaned up public option typings by removing redundant `| undefined` unions from fetch configuration types and overloads.
- Updated dependency `@zap-studio/validation` to `0.3.3`.

## [0.5.0]

### Added

- Documented the throwable error surface for `$fetch`, `createFetch`, and internal request execution with explicit `@throws` tags (for example `FetchError`, `ValidationError`, `TypeError`, `DOMException`, `SyntaxError`, and validator-thrown errors).
- Added full package test coverage across statements, branches, functions, and lines.

### Changed

- **Breaking:** Request bodies are no longer auto-serialized from plain objects; use the explicit `json` option (or set `body` yourself). `body` and `json` are mutually exclusive at the type level and enforced at runtime.
- Simplified the request API around web platform types.
  - The first argument is now named `input` and typed as `FetchInput` (`Parameters<typeof fetch>[0]` from `lib.dom`), exported from `@zap-studio/fetch/types`. This means the allowed inputs update on their own when the DOM types for `fetch` change.
  - Non-`Request` values (including `URL`) are normalized to a string URL before query merge.
  - `ExtendedRequestInit` now extends native `RequestInit` directly instead of redefining request options.
  - `searchParams` now accepts the same input shape as `new URLSearchParams(...)`.
- Replaced automatic object body serialization with an explicit `json` option.
  - Use `json: value` when you want JSON stringification and `Content-Type: application/json`.
  - Use native `body` when you want standard `fetch` behavior.
  - `body` and `json` are mutually exclusive in TypeScript and guarded at runtime.
- Reworked URL handling to use the platform `URL` and `URLSearchParams` APIs while preserving relative URL output when no `baseURL` is configured.
- Simplified the internal module structure and removed the old `utils` module.
- Reworked tests to mirror the `src` module structure.
- JSR dependency mapping now pins `@zap-studio/validation` to `0.3.2`.

### Fixed

- Fixed absolute URL handling when no `baseURL` is configured.
- `resolveSearchParams` keeps a trailing `#` when the input URL had an empty fragment (for example `.../path#`), matching typical `URL` serialization instead of dropping the delimiter.

## [0.4.7]

### Changed

- e26293e: Updated dependencies.
  - @zap-studio/validation@0.3.2

## [0.4.6]

### Changed

- 5ea3d3b: Updated dependencies.
  - @zap-studio/validation@0.3.1

## [0.4.5]

### Changed

- f75b984: Updated dependency `@zap-studio/validation` to `0.3.0`.

## [0.4.4]

### Fixed

- 59a8d71: Fixed JSON request body handling.
  - Accept JSON values (including arrays) in `ExtendedRequestInit.body`.
  - Auto-stringify plain JSON body values even when no response schema is provided.
  - Set `Content-Type: application/json` only when auto-stringifying and no explicit content type is set.

## [0.4.3]

### Changed

- e4542bb: Refined `standardValidate` typings so return types depend on `throwOnError`, and updated `@zap-studio/fetch` integration while preserving the existing boolean configuration API.
- e4542bb: Updated dependency `@zap-studio/validation` to `0.2.1`.

## [0.4.2]

### Changed

- 2de8183: Updated dependency `@zap-studio/validation` to `0.2.0`.

## [0.4.1]

### Changed

- 447dbda: Switched shared Standard Schema validation utilities to `@zap-studio/validation`.
- 447dbda: Updated dependency `@zap-studio/validation` to `0.1.0`.

## [0.4.0]

### Added

- 69057cd: Exposed fetch defaults constants and utility helpers as public exports.

## [0.3.1]

### Changed

- 9919f63: Added discriminated return types based on `throwOnValidationError`.
  - `throwOnValidationError: true` (default) returns `Promise<TSchema>`.
  - `throwOnValidationError: false` returns `Promise<StandardSchemaV1.Result<TSchema>>`.
  - This improves type safety and removes manual narrowing in default usage.

## [0.3.0]

### Added

- 659621c: Added `searchParams` support in `createFetch` for factory-level default query parameters.
  - Per-request `searchParams` still override factory defaults.

## [0.2.2]

### Changed

- 5c3abbf: Prepared JSR publish and `isolatedDeclarations` support with explicit `$Fetch` and `ApiMethods` types.

## [0.2.1]

### Changed

- 82bac5c: Replaced regex-based slash trimming with more efficient string manipulation for URL normalization.

## [0.2.0]

### Added

- 78afb76: Added `createFetch()` factory pattern for pre-configured instances.
- 78afb76: Added smart URL behavior so absolute URLs bypass `baseURL`.
- 78afb76: Added automatic JSON body serialization and `Content-Type` handling for schema-based requests.

### Changed

- 78afb76: Migrated from Zod-only validation to Standard Schema v1 for broader validator compatibility.
  - Supported libraries include Zod, Valibot, ArkType, and other Standard Schema-compliant validators.
- 78afb76: **Breaking:** Standard Schema-compliant validator libraries are now required (for example Zod 3.23+, Valibot 1.0+, ArkType 2.0+).
- 78afb76: **Breaking:** Internal file structure was reorganized (affects deep imports).
- 78afb76: **Breaking:** `FetchError` constructor now requires `(message, response)`.

## [0.1.2]

### Changed

- 69c2b21: Renamed `safeFetch` to `$fetch` while preserving `safeFetch` compatibility for legacy usage.

## [0.1.1]

### Changed

- 5f1812b: Updated `files` in `package.json` to publish only required artifacts.

## [0.1.0]

### Added

- 1644006: Initial release of `@zap-studio/fetch`.
  - Type-safe HTTP requests with Zod validation.
  - Automatic content-type handling.
  - Multiple response type support.
  - API methods for GET, POST, PUT, PATCH, and DELETE.
  - Flexible error handling.
  - Custom `FetchError` class.
  - Full TypeScript support.
