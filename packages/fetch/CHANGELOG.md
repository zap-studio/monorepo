# @zap-studio/fetch

## 0.4.2

### Patch Changes

- Updated dependencies [2de8183]
  - @zap-studio/validation@0.2.0

## 0.4.1

### Patch Changes

- 447dbda: Extract shared Standard Schema validation utilities into `@zap-studio/validation` and update `@zap-studio/fetch` to depend on them.
- Updated dependencies [447dbda]
  - @zap-studio/validation@0.1.0

## 0.4.0

### Minor Changes

- 69057cd: Expose fetch defaults constants and utility helpers as public exports.

## 0.3.1

### Patch Changes

- 9919f63: Add discriminated return types based on `throwOnValidationError` option

  The return type of `$fetch` and `api.*` methods now correctly narrows based on the `throwOnValidationError` option:

  - When `throwOnValidationError: true` (default) or unspecified: returns `Promise<TSchema>` (the validated data directly)
  - When `throwOnValidationError: false`: returns `Promise<StandardSchemaV1.Result<TSchema>>` (the result object with `value` or `issues`)

  This improves type safety by eliminating the need for manual type narrowing when using the default behavior.

## 0.3.0

### Minor Changes

- 659621c: Add `searchParams` option to `createFetch` to allow factory-level default query/search parameters. Per-request `searchParams` continue to override factory defaults.

## 0.2.2

### Patch Changes

- 5c3abbf: Prepare JSR publish and isolatedDeclarations support with new explicit types for `$Fetch` and `ApiMethods`

## 0.2.1

### Patch Changes

- 82bac5c: Replace regex-based slash trimming with more efficient string manipulation functions for URL normalization

## 0.2.0

### Minor Changes

- 78afb76: ### Standard Schema Support

  Migrated from Zod-only validation to **Standard Schema v1** specification, enabling support for multiple validation libraries:

  - Zod
  - Valibot
  - ArkType
  - Any Standard Schema compliant library

  ### New Features

  - **Factory Pattern**: `createFetch()` for creating pre-configured fetch instances with `baseURL`, default `headers`, and error handling options
  - **Smart URL Handling**: Absolute URLs bypass `baseURL` configuration
  - **Auto JSON Body**: Automatic `JSON.stringify()` and `Content-Type` header when using schemas with request bodies

  ### Breaking Changes

  - Schema validation now requires Standard Schema compliant libraries (Zod 3.23+, Valibot 1.0+, ArkType 2.0+)
  - Internal file structure reorganized (affects deep imports if any were used)
  - `FetchError` constructor signature changed: now requires `(message, response)`

  ### Migration Guide

  ```typescript
  // Before (Zod-only)
  import { $fetch } from "@zap-studio/fetch";
  import { z } from "zod";

  // After (Standard Schema - works the same with Zod!)
  import { $fetch } from "@zap-studio/fetch";
  import { z } from "zod"; // Zod 3.23+ is Standard Schema compliant

  // Or use other libraries
  import * as v from "valibot";
  import { type } from "arktype";
  ```

## 0.1.2

### Patch Changes

- 69c2b21: Change `safeFetch` to `$fetch` syntax and make sure `safeFetch` can also be used for legacy

## 0.1.1

### Patch Changes

- 5f1812b: Change files field in package.json to distribute only necessary artifacts

## 0.1.0

### Minor Changes

- 1644006: Comprehensive description of the initial release features including:

  - Type-safe HTTP requests with Zod validation
  - Automatic content-type handling
  - Multiple response type support
  - Convenient API methods (GET, POST, PUT, PATCH, DELETE)
  - Flexible error handling
  - Custom FetchError class
  - Full TypeScript support
