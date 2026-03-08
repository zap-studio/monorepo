# @zap-studio/permit

## 0.2.2

### Patch Changes

- e26293e: Updated dependencies.
  - @zap-studio/validation@0.3.2

## 0.2.1

### Patch Changes

- 5ea3d3b: Updated dependencies.
  - @zap-studio/validation@0.3.1

## 0.2.0

### Changed

- f0f503e: Made policy evaluation asynchronous by default.

### Breaking Changes

- f0f503e: `policy.can(...)` now returns `Promise<boolean>`.
- f0f503e: `createPolicy()` now uses async-safe Standard Schema validation for resource schemas (including async resource schemas); this is not a separate `Policy` schema API.
- f0f503e: The `Policy` interface changed so `can()` is async, and `mergePolicies`/`mergePoliciesAny` are async accordingly.
- Action required: callers must `await policy.can(...)` and handle `mergePolicies`/`mergePoliciesAny` as async operations; also account for async-safe resource schema validation in `createPolicy()`.

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
