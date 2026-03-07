# @zap-studio/fetch

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
