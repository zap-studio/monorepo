## @zap-studio/fetch@0.5.6

### Tree-shakeable root re-exports

The package root now re-exports the full public API, so everything can be imported from `@zap-studio/fetch` directly (`$fetch`, `api`, `createFetch`, `FetchError`, `mergeHeaders`, `GLOBAL_DEFAULTS`, `normalizeRequest`, `resolveRequestUrl`, and all public types). All exports are side-effect free and tree-shakeable; granular subpath imports keep working.

- The `$fetch`/`api`/`createFetch` implementation moved from the entrypoint into its own module, available as the new `./fetch` subpath.
- Removed the `./internal` and `./methods` subpath exports. Both were implementation details (`fetchInternal`, `createMethod`) and are no longer part of the public API.

## @zap-studio/fetch@0.5.5

### Migrate to ultracite lint/format

Internal formatting and lint cleanup only. No public API or behavior change.

# @zap-studio/fetch

## 0.5.4

### Changed

- Added fetch ecosystem benchmarks and grouped benchmark output for easier cross-library comparisons.
- Applied small internal performance optimizations in request preparation, URL resolution, and header merging without changing public API behavior.

## 0.5.3

### Changed

- Refactor `createFetch(...)` to derive fallback defaults from `GLOBAL_DEFAULTS` instead of re-defining primitive defaults inline.

## 0.5.2

### Changed

- Expand TSDoc coverage across fetch modules and exported contracts for stronger JSR documentation completeness.

### Dependencies

- Updated dependency `@zap-studio/validation` to `0.3.4`.

## 0.5.1

### Fixed

- d92f2c2: Preserve explicit `throwOnValidationError: true` overrides in `$fetch` method helpers and factory-created fetch clients.

### Changed

- 2ea1a70: Cleaned up public option typings by removing redundant `| undefined` unions from fetch configuration types and overloads.

### Dependencies

- Updated dependency `@zap-studio/validation` to `0.3.3`.

## 0.5.0

### Breaking

- Request bodies are no longer auto-serialized from plain objects; use the explicit `json` option (or set `body` yourself). `body` and `json` are mutually exclusive at the type level and enforced at runtime.

### Changed

- Simplified the request API around web platform types.
  - The first argument is named `input` and typed as `FetchInput` (`Parameters<typeof fetch>[0]` from `lib.dom`), exported from `@zap-studio/fetch/types`, so allowed inputs track global `fetch` when DOM typings change.
  - Non-`Request` values (including `URL`) are normalized to a string URL before query merge.
  - `ExtendedRequestInit` now extends native `RequestInit` directly instead of redefining request options.
  - `searchParams` now accepts the same input shape as `new URLSearchParams(...)`.
- Replaced automatic object body serialization with an explicit `json` option.
  - Use `json: value` when you want JSON stringification and `Content-Type: application/json`.
  - Use native `body` when you want standard `fetch` behavior.
  - `body` and `json` are mutually exclusive in TypeScript and guarded at runtime.
- Reworked URL handling to use the platform `URL` and `URLSearchParams` APIs while preserving relative URL output when no `baseURL` is configured.
- Simplified the internal module structure and removed the old `utils` module.

### Fixed

- Fixed absolute URL handling when no `baseURL` is configured.
- `resolveSearchParams` keeps a trailing `#` when the input URL had an empty fragment (for example `.../path#`), matching typical `URL` serialization instead of dropping the delimiter.

### Tests

- Reworked tests to mirror the `src` module structure.
- Added full package coverage across statements, branches, functions, and lines.

### Documentation

- Documented the throwable error surface for `$fetch`, `createFetch`, and internal request execution with explicit `@throws` tags (for example `FetchError`, `ValidationError`, `TypeError`, `DOMException`, `SyntaxError`, and validator-thrown errors).

### Dependencies

- JSR dependency mapping now pins `@zap-studio/validation` to `0.3.2`.

## 0.4.7

### Patch Changes

- e26293e: Updated dependencies.
  - @zap-studio/validation@0.3.2

## 0.4.6

### Patch Changes

- 5ea3d3b: Updated dependencies.
  - @zap-studio/validation@0.3.1

## 0.4.5

### Dependencies

- f75b984: Updated dependency `@zap-studio/validation` to `0.3.0`.

## 0.4.4

### Fixed

- 59a8d71: Fixed JSON request body handling.
  - Accept JSON values (including arrays) in `ExtendedRequestInit.body`.
  - Auto-stringify plain JSON body values even when no response schema is provided.
  - Set `Content-Type: application/json` only when auto-stringifying and no explicit content type is set.

## 0.4.3

### Changed

- e4542bb: Refined `standardValidate` typings so return types depend on `throwOnError`, and updated `@zap-studio/fetch` integration while preserving the existing boolean configuration API.

### Dependencies

- e4542bb: Updated dependency `@zap-studio/validation` to `0.2.1`.

## 0.4.2

### Dependencies

- 2de8183: Updated dependency `@zap-studio/validation` to `0.2.0`.

## 0.4.1

### Changed

- 447dbda: Switched shared Standard Schema validation utilities to `@zap-studio/validation`.

### Dependencies

- 447dbda: Updated dependency `@zap-studio/validation` to `0.1.0`.

## 0.4.0

### Added

- 69057cd: Exposed fetch defaults constants and utility helpers as public exports.

## 0.3.1

### Changed

- 9919f63: Added discriminated return types based on `throwOnValidationError`.
  - `throwOnValidationError: true` (default) returns `Promise<TSchema>`.
  - `throwOnValidationError: false` returns `Promise<StandardSchemaV1.Result<TSchema>>`.
  - This improves type safety and removes manual narrowing in default usage.

## 0.3.0

### Added

- 659621c: Added `searchParams` support in `createFetch` for factory-level default query parameters.
  - Per-request `searchParams` still override factory defaults.

## 0.2.2

### Changed

- 5c3abbf: Prepared JSR publish and `isolatedDeclarations` support with explicit `$Fetch` and `ApiMethods` types.

## 0.2.1

### Changed

- 82bac5c: Replaced regex-based slash trimming with more efficient string manipulation for URL normalization.

## 0.2.0

### Changed

- 78afb76: Migrated from Zod-only validation to Standard Schema v1 for broader validator compatibility.
  - Supported libraries include Zod, Valibot, ArkType, and other Standard Schema-compliant validators.

### Added

- 78afb76: Added `createFetch()` factory pattern for pre-configured instances.
- 78afb76: Added smart URL behavior so absolute URLs bypass `baseURL`.
- 78afb76: Added automatic JSON body serialization and `Content-Type` handling for schema-based requests.

### Breaking

- 78afb76: Standard Schema-compliant validator libraries are now required (for example Zod 3.23+, Valibot 1.0+, ArkType 2.0+).
- 78afb76: Internal file structure was reorganized (affects deep imports).
- 78afb76: `FetchError` constructor now requires `(message, response)`.

## 0.1.2

### Changed

- 69c2b21: Renamed `safeFetch` to `$fetch` while preserving `safeFetch` compatibility for legacy usage.

## 0.1.1

### Changed

- 5f1812b: Updated `files` in `package.json` to publish only required artifacts.

## 0.1.0

### Added

- 1644006: Initial release of `@zap-studio/fetch`.
  - Type-safe HTTP requests with Zod validation.
  - Automatic content-type handling.
  - Multiple response type support.
  - API methods for GET, POST, PUT, PATCH, and DELETE.
  - Flexible error handling.
  - Custom `FetchError` class.
  - Full TypeScript support.
