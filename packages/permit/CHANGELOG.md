## @zap-studio/permit@0.4.0

### Reduced module surface (breaking)

Folded `_helpers.ts` away: `parsePermission` moved into `policy.ts` (its only consumer, still private). `assertNever` is removed — it had no internal consumers and existed only as a generic exhaustiveness-check convenience; use your own `never`-typed helper if you relied on it.

## @zap-studio/permit@0.3.4

### Tree-shakeable root re-exports

The package root now re-exports the full public API, so everything can be imported from `@zap-studio/permit` directly, including `PolicyError`, `assertNever`, and all public types. All exports are side-effect free and tree-shakeable; granular subpath imports keep working.

- The implementation moved out of the entrypoint into two new subpaths: `./conditions` (`allow`, `deny`, `when`, `and`, `or`, `not`, `has`, `hasRole`, `collectInheritedRoles`) and `./policy` (`createPolicy`, `mergePolicies`, `mergePoliciesAny`).

## @zap-studio/permit@0.3.3

### Migrate to ultracite lint/format

Internal formatting and lint cleanup only. No public API or behavior change.

# @zap-studio/permit

## 0.3.2

### Dependencies

- Updated dependency `@zap-studio/validation` to `0.3.4`.

## 0.3.1

### Fixed

- d10d8c4: Removed the TanStack Intent-specific authoring helper from the package surface.
- d9ba7d1: Reworked the packaged permit skill content.

### Changed

- 5fa58b1: Reduced policy evaluation complexity by extracting permission parsing and merge strategy helpers without changing the `policy.can(...)` API.
- abfda4b: Cleaned up public option typings by removing redundant `| undefined` unions from package types.
- 9f31f87: Switched the package build to ESNext-aligned output and updated package tooling and publish metadata.

### Dependencies

- Updated dependency `@zap-studio/validation` to `0.3.3`.

## 0.3.0

### Minor Changes

- fe60f55: Change `policy.can()` to use a single permission string plus the resource object.

  `policy.can(ctx, "read", "post", post)` is replaced by `policy.can(ctx, "post:read", post)`.

  This is a breaking API change in the `0.x` line. Docs and examples now use the new permission-string format consistently.

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
