# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0]

### Added

Native OpenTelemetry support. Every `can(...)` call gets an `INTERNAL` span (`permit.check {resourceType}:{action}`) with the decision (`"allow"`/`"deny"`) set as a span attribute, plus a `permit.checks` counter tagged the same way. `mergePoliciesAnd`/`mergePoliciesOr` get their own wrapping span around the composite check. See [OpenTelemetry](https://www.zapstudio.dev/permit/opentelemetry).

### Changed

**Breaking:** `@opentelemetry/api` is now a required peer dependency. It's tiny, side-effect-free, and a no-op until an app registers a real SDK, so nothing changes at runtime for consumers who don't set one up — but the package won't resolve without it installed: `npm install @opentelemetry/api`.

## [1.1.1]

### Changed

`@zap-studio/logger` is now an optional peer dependency instead of a regular dependency. Every import from it is type-only (`import type { Logger }`), so it was never pulled in at runtime — pass any object matching the `Logger` shape (including `pino`) with no install required. Existing consumers of `logger?: Logger` are unaffected.

## [1.1.0]

### Added

`createPolicy(...)` gains an optional `logger?: Logger` option (from `@zap-studio/logger`). When provided, it logs allow decisions at `debug` and deny decisions at `info`. Internal-error warnings (resource validation and policy evaluation errors) route through the logger's `warn` instead of `console.warn` when a logger is provided; without one, they still print via `console.warn` as before. See [Logging](https://www.zapstudio.dev/permit/logging).

## [1.0.0]

### Changed

- Clarified tree-shakeable design in the package description and README (no code change).

### Removed

`assertNever` is no longer exported — it had no internal consumers and existed only as a generic exhaustiveness-check convenience. Use your own `never`-typed helper if you relied on it.

### Fixed

Neither merge strategy short-circuits anymore. All policies now run concurrently via `Promise.allSettled`, and every policy is invoked regardless of outcome, for both `mergePoliciesSome` (allow) and `mergePoliciesEvery` (deny). A rejecting policy no longer sinks the whole check — it's treated as a deny (`false`) and logged with `console.warn`, consistent with how `createPolicy` handles internal validation/evaluation errors.

## [0.3.4]

### Added

The package root now re-exports the full public API, so everything can be imported from `@zap-studio/permit` directly, including `PolicyError`, `assertNever`, and all public types. All exports are side-effect free and tree-shakeable; granular subpath imports keep working.

- The implementation moved out of the entrypoint into two new subpaths: `./conditions` (`allow`, `deny`, `when`, `and`, `or`, `not`, `has`, `hasRole`, `collectInheritedRoles`) and `./policy` (`createPolicy`, `mergePolicies`, `mergePoliciesAny`).

## [0.3.3]

### Changed

Internal formatting and lint cleanup only. No public API or behavior change.

## [0.3.2]

### Changed

- Updated dependency `@zap-studio/validation` to `0.3.4`.

## [0.3.1]

### Changed

- 5fa58b1: Reduced policy evaluation complexity by extracting permission parsing and merge strategy helpers without changing the `policy.can(...)` API.
- abfda4b: Cleaned up public option typings by removing redundant `| undefined` unions from package types.
- 9f31f87: Switched the package build to ESNext-aligned output and updated package tooling and publish metadata.
- d9ba7d1: Reworked the packaged permit skill content.
- Updated dependency `@zap-studio/validation` to `0.3.3`.

### Removed

- d10d8c4: Removed the TanStack Intent-specific authoring helper from the package surface.

## [0.3.0]

### Changed

- fe60f55: **Breaking:** Changed `policy.can()` to use a single permission string plus the resource object.

  `policy.can(ctx, "read", "post", post)` is replaced by `policy.can(ctx, "post:read", post)`.

  This is a breaking API change in the `0.x` line. Docs and examples now use the new permission-string format consistently.

## [0.2.2]

### Changed

- e26293e: Updated dependencies.
  - @zap-studio/validation@0.3.2

## [0.2.1]

### Changed

- 5ea3d3b: Updated dependencies.
  - @zap-studio/validation@0.3.1

## [0.2.0]

### Changed

- f0f503e: Made policy evaluation asynchronous by default.
- f0f503e: **Breaking:** `policy.can(...)` now returns `Promise<boolean>`.
- f0f503e: **Breaking:** `createPolicy()` now uses async-safe Standard Schema validation for resource schemas (including async resource schemas); this is not a separate `Policy` schema API.
- f0f503e: **Breaking:** The `Policy` interface changed so `can()` is async, and `mergePolicies`/`mergePoliciesAny` are async accordingly.
- Action required: callers must `await policy.can(...)` and handle `mergePolicies`/`mergePoliciesAny` as async operations; also account for async-safe resource schema validation in `createPolicy()`.
- f75b984: Updated dependency `@zap-studio/validation` to `0.3.0`.

## [0.1.3]

### Changed

- e4542bb: Updated dependency `@zap-studio/validation` to `0.2.1`.

## [0.1.2]

### Changed

- 2de8183: Adopted shared synchronous Standard Schema validator utilities from `@zap-studio/validation` for resource schema validation in `createPolicy`.
- 2de8183: Updated dependency `@zap-studio/validation` to `0.2.0`.

## [0.1.1]

### Fixed

- 907d903: Added runtime resource validation and fail-closed behavior, including deny-by-default when merges are invoked with no policies.

## [0.1.0]

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
