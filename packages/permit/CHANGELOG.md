# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0]

### Added

Added native OpenTelemetry support. Every `can(...)` call now gets an `INTERNAL` span (`permit.check {resourceType}:{action}`). The span has the decision (`"allow"`/`"deny"`) as an attribute. There is also a `permit.checks` counter with the same tag. `mergePoliciesAnd`/`mergePoliciesOr` get their own span around the combined check. See [OpenTelemetry](https://www.zapstudio.dev/permit/opentelemetry).

### Changed

**Breaking:** `@opentelemetry/api` is now a required peer dependency. It is small, has no side effects, and does nothing until an app sets up a real SDK. So nothing changes at runtime if you don't set one up. But the package will not install without it: run `npm install @opentelemetry/api`.

## [1.1.1]

### Changed

`@zap-studio/logger` is now an optional peer dependency, not a regular one. Every import from it is type-only (`import type { Logger }`), so it was never loaded at runtime. You can pass any object that matches the `Logger` shape (`pino` included) with no install needed. If you already use `logger?: Logger`, nothing changes for you.

## [1.1.0]

### Added

`createPolicy(...)` now takes an optional `logger?: Logger` option (from `@zap-studio/logger`). If you pass one, it logs allow decisions at `debug` and deny decisions at `info`. Internal-error warnings (from resource validation and policy checks) go through the logger's `warn` instead of `console.warn`, when a logger is set. With no logger, they still print with `console.warn`, as before. See [Logging](https://www.zapstudio.dev/permit/logging).

## [1.0.0]

### Changed

- Made the package description and README clearer about the tree-shakeable design. No code change.

### Removed

`assertNever` is no longer exported. Nothing inside the package used it — it was only there as a generic exhaustiveness-check helper. If you used it, write your own `never`-typed helper instead.

### Fixed

Neither merge strategy stops early anymore. All policies now run at the same time, with `Promise.allSettled`. Every policy runs, no matter the outcome, for both `mergePoliciesSome` (allow) and `mergePoliciesEvery` (deny). A policy that rejects no longer breaks the whole check. It is now treated as a deny (`false`) and logged with `console.warn`, the same way `createPolicy` handles its own internal errors.

## [0.3.4]

### Added

The package root now re-exports the full public API. You can import everything from `@zap-studio/permit` directly, including `PolicyError`, `assertNever`, and all public types. All exports have no side effects and are tree-shakeable. Subpath imports still work too.

- The code moved out of the entrypoint into two new subpaths: `./conditions` (`allow`, `deny`, `when`, `and`, `or`, `not`, `has`, `hasRole`, `collectInheritedRoles`) and `./policy` (`createPolicy`, `mergePolicies`, `mergePoliciesAny`).

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
- f0f503e: **Breaking:** `createPolicy()` now uses async-safe Standard Schema validation for resource schemas, including async ones. This is not a separate `Policy` schema API.
- f0f503e: **Breaking:** The `Policy` interface changed so `can()` is async, and `mergePolicies`/`mergePoliciesAny` are async too.
- Action required: callers must `await policy.can(...)` and handle `mergePolicies`/`mergePoliciesAny` as async operations. Also check that `createPolicy()` now validates resource schemas in an async-safe way.
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
