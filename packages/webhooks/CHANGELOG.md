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
