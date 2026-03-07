# @zap-studio/webhooks

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
