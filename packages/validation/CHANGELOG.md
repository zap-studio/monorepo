# @zap-studio/validation

## 0.2.1

### Patch Changes

- e4542bb: Refine `standardValidate` typings so the return type depends on the `throwOnError` flag, and update `@zap-studio/fetch` to integrate with the new overloads while preserving its boolean configuration API.

## 0.2.0

### Minor Changes

- 2de8183: Add a reusable synchronous Standard Schema validator helper in `@zap-studio/validation` and refactor `@zap-studio/permit` to use it for resource schema validation in `createPolicy`.

## 0.1.0

### Minor Changes

- 447dbda: Extract shared Standard Schema validation utilities into `@zap-studio/validation` and update `@zap-studio/fetch` to depend on them.
