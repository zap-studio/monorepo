# @zap-studio/webhooks

## 0.1.1

### Patch Changes

- Updated dependencies [f75b984]
  - @zap-studio/validation@0.3.0

## 0.1.0

### Minor Changes

- 0d6254c: Initial public release of `@zap-studio/webhooks`.

  - Introduces a schema-first webhook router with inferred payload types.
  - Adds request verification support, including `createHmacVerifier`.
  - Provides lifecycle hooks (`before`, `after`, `onError`) for cross-cutting concerns.
  - Exposes framework-agnostic adapter contracts via `Adapter` and `BaseAdapter`.
  - Includes comprehensive test coverage and documentation.
