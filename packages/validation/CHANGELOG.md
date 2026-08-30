# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1]

### Changed

We removed the `@zap-studio/monads` dependency and the exports 1.1.0 added: `standardValidateResult`, `standardValidateResultSync`, `createStandardValidatorResult`, `createStandardValidatorResultSync`. These added a dependency and more bundle size, for something you can already do yourself: wrap `standardValidate`/`standardValidateSync` with `@zap-studio/monads`'s `fromPromise`/`fromThrowable`. See the README section "Using with `@zap-studio/monads`". We deprecated 1.1.0 on npm in favor of this release. The `instanceof Promise` fix below stays.

## [1.1.0] (deprecated — see 1.1.1)

### Added

- Added new functions that return `Result`/`ResultAsync` instead of throwing: `standardValidateResult`, `standardValidateResultSync`, `createStandardValidatorResult`, and `createStandardValidatorResultSync`. They use the new `@zap-studio/monads` dependency. These are new and optional — `standardValidate`, `standardValidateSync`, and the existing `throwOnError` behavior do not change. Only a validation issue becomes `Err`. A broken schema still throws.

### Fixed

- Fixed how we detect an async schema. We used `instanceof Promise`, but this check returns `false` for a Promise made in a different JavaScript realm (a separate `vm.Context`, an iframe, or a worker) — even though the Standard Schema spec allows that. Before this fix, the code read the value as a sync result by mistake (`Ok(undefined)`, `undefined`, or an unresolved raw result, depending on the function), instead of awaiting or rejecting it. This affects `standardValidate`, `standardValidateSync`, `standardValidateResult`, `standardValidateResultSync`, and the `createStandardValidator*` factories built on them.

## [1.0.0]

### Changed

- Made the package description and README clearer about the tree-shakeable design. No code change.
- **Breaking:** Renamed `createSyncStandardValidator` to `createStandardValidatorSync`, to match the name `standardValidateSync`. Update your imports and calls. The error message for async schemas now reads `Async schemas are not supported by createStandardValidatorSync`.

## [0.3.6]

### Added

The package root now re-exports the full public API, so `ValidationError` can be imported from `@zap-studio/validation` directly alongside the validators. All exports have no side effects and are tree-shakeable. Subpath imports still work too.

- The validator implementation moved from the entrypoint into its own module, available as the new `./validate` subpath.

## [0.3.5]

### Changed

Internal formatting and lint cleanup with no public API change. `isStandardSchema` now accepts an optional argument, and `standardValidateSync` throws a `TypeError` (still an `Error`) for async schemas.

## [0.3.4]

### Changed

- Improve hot-path performance with lower-overhead validator execution internals while preserving the existing public API.
- Expand TSDoc coverage for overload signatures and module-level exports to strengthen JSR documentation quality.

## [0.3.3]

### Changed

- 2a1787f: Removed redundant `| undefined` unions from public option types and overloads.
- 9f31f87: Switched the package build to ESNext-aligned output and updated package tooling and publish metadata.
- 367d588: Expanded TSDoc coverage for validator error behavior and reusable validator helpers.

### Fixed

- 7004e9f: Allow explicit `undefined` in validator option handling while preserving typed throwing and non-throwing overload behavior.

## [0.3.2]

### Added

- e26293e: Re-export `StandardSchemaV1` type from the Standard Schema specification package and add module docs.

## [0.3.1]

### Added

- 5ea3d3b: Refactored reusable validators to delegate to `standardValidate`/`standardValidateSync` and added per-call options support.
  - `createStandardValidator` now supports `throwOnError` with the same return-type behavior as `standardValidate`.
  - `createSyncStandardValidator` now supports `throwOnError` with the same return-type behavior as `standardValidateSync`.
  - Updated docs and examples for reusable validator option handling.

## [0.3.0]

### Added

- 5acf43b: Added `createStandardValidator` for reusable async validation flows.
- 5acf43b: Added `standardValidateSync` for synchronous validation with throwing and non-throwing overloads.

### Changed

- 4b3ce9f: Changed `standardValidate` to accept an options object (`{ throwOnError }`) instead of a boolean argument, while preserving typed return behavior.

## [0.2.1]

### Changed

- e4542bb: Refined `standardValidate` typings so return types depend on `throwOnError`, and updated `@zap-studio/fetch` integration to keep its boolean configuration API behavior.

## [0.2.0]

### Added

- 2de8183: Added a reusable synchronous Standard Schema validator helper.

### Changed

- 2de8183: Updated `@zap-studio/permit` to use the new helper for resource schema validation in `createPolicy`.

## [0.1.0]

### Added

- 447dbda: Initial extraction of shared Standard Schema validation utilities into `@zap-studio/validation`.

### Changed

- 447dbda: Updated `@zap-studio/fetch` to consume the shared validation utilities.
