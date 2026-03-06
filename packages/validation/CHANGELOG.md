# @zap-studio/validation

All notable changes to this package are documented in this file.

## 0.3.0

### Added

- 5acf43b: Added `createStandardValidator` for reusable async validation flows.
- 5acf43b: Added `standardValidateSync` for synchronous validation with throwing and non-throwing overloads.

### Changed

- 4b3ce9f: Changed `standardValidate` to accept an options object (`{ throwOnError }`) instead of a boolean argument, while preserving typed return behavior.

## 0.2.1

### Changed

- e4542bb: Refined `standardValidate` typings so return types depend on `throwOnError`, and updated `@zap-studio/fetch` integration to keep its boolean configuration API behavior.

## 0.2.0

### Added

- 2de8183: Added a reusable synchronous Standard Schema validator helper.

### Changed

- 2de8183: Updated `@zap-studio/permit` to use the new helper for resource schema validation in `createPolicy`.

## 0.1.0

### Added

- 447dbda: Initial extraction of shared Standard Schema validation utilities into `@zap-studio/validation`.

### Changed

- 447dbda: Updated `@zap-studio/fetch` to consume the shared validation utilities.
