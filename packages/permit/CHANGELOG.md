# @zap-studio/permit

All notable changes to this package are documented in this file.

## 0.2.0

### Changed

- f0f503e: Made policy evaluation asynchronous by default.

### Breaking Changes

- f0f503e: `policy.can(...)` now returns `Promise<boolean>`.
- f0f503e: `createPolicy` now uses async-safe Standard Schema validation, including support for async resource schemas.
- f0f503e: `mergePolicies` and `mergePoliciesAny` are now async via the shared `Policy` interface.
- Action required: update call sites to `await policy.can(...)`, handle `mergePolicies`/`mergePoliciesAny` asynchronously, and accommodate async-safe `createPolicy`/`Policy` schema validation.

### Dependencies

- f75b984: Updated dependency `@zap-studio/validation` to `0.3.0`.

## 0.1.3

### Dependencies

- e4542bb: Updated dependency `@zap-studio/validation` to `0.2.1`.

## 0.1.2

### Changed

- 2de8183: Adopted shared synchronous Standard Schema validator utilities from `@zap-studio/validation` for resource schema validation in `createPolicy`.

### Dependencies

- 2de8183: Updated dependency `@zap-studio/validation` to `0.2.0`.

## 0.1.1

### Fixed

- 907d903: Added runtime resource validation and fail-closed behavior, including deny-by-default when merges are invoked with no policies.

## 0.1.0

### Added

- 0627885: Initial release of `@zap-studio/permit`.
  - Declarative policy creation with `createPolicy()`.
  - Policy rules: `allow()`, `deny()`, and `when()` for conditional access.
  - Condition combinators: `and()`, `or()`, `not()`, and `has()`.
  - Role-based access control with `hasRole()` and role hierarchies.
  - Policy merging with `mergePolicies()` (deny-overrides) and `mergePoliciesAny()` (allow-overrides).
  - Standard Schema support (Zod, Valibot, ArkType, and more).
  - Full TypeScript type inference support.
  - `PolicyError` for authorization failures.
  - `assertNever()` for exhaustive checks.
