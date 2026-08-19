# @zap-studio/validation

Utilities for validating values using the [**Standard Schema**](https://standardschema.dev/schema) specification.

Full documentation: [zapstudio.dev/validation](https://www.zapstudio.dev/validation)

## Motivation

Zod throws a `ZodError`. Valibot returns a result object. ArkType has its own shape. If your code — or a library you are writing — needs to support more than one of these, or wants to let its users bring whichever one they prefer, you end up writing different error-handling code for each.

And if you ever switch from one to another, every call site that touches validation needs to change too.

`@zap-studio/validation` removes this difference. `standardValidate` and `standardValidateSync` give you one function and one `ValidationError` shape, no matter which Standard Schema library sits underneath.

Validation code becomes portable: swap the schema library later, and the code that calls it does not need to change.

## Installation

```bash
npm install @zap-studio/validation
```

## Features

- **Async-safe validation** via `standardValidate`, works with sync and async schemas.
- **Synchronous validation** via `standardValidateSync`, for schemas known to validate synchronously.
- **Reusable validators** via `createStandardValidator` and `createStandardValidatorSync`.
- **Optional throwing behavior** via `throwOnError`, backed by a shared `ValidationError` class.
- **Runtime schema detection** via `isStandardSchema`.
- **Type re-exports** — `StandardSchemaV1` and `StandardTypedV1` directly from this package.
- **Tree-shakeable** — every helper is a standalone function; unused exports are dropped by any modern bundler.

## Quick Start

```ts
import { standardValidate } from "@zap-studio/validation";

// `userSchema` can come from any Standard Schema-compatible library
try {
  const user = await standardValidate(input, userSchema, {
    throwOnError: true,
  });

  console.log("Validation passed:", user);
} catch (error) {
  console.error("Validation failed:", error);
}
```

## Synchronous Validation

Via `standardValidateSync`, for schemas known to validate synchronously.

```ts
import { standardValidateSync } from "@zap-studio/validation";

const result = standardValidateSync(input, userSchema);
```

## Reusable Validators

Via `createStandardValidator` and `createStandardValidatorSync`.

```ts
import { createStandardValidator } from "@zap-studio/validation";

const validateUser = createStandardValidator(userSchema);
const user = await validateUser(input, { throwOnError: true });
```

## Optional Throwing Behavior

Via `throwOnError`, backed by a shared `ValidationError` class.

```ts
import { standardValidate, ValidationError } from "@zap-studio/validation";

try {
  await standardValidate(input, userSchema, { throwOnError: true });
} catch (error) {
  if (error instanceof ValidationError) console.error(error.issues);
}
```

## Runtime Schema Detection

Via `isStandardSchema`.

```ts
import { isStandardSchema, standardValidate } from "@zap-studio/validation";

if (isStandardSchema(schemaLike)) {
  await standardValidate(input, schemaLike);
}
```

## Type Re-exports

`StandardSchemaV1` and `StandardTypedV1` directly from this package.

```ts
import type { StandardSchemaV1, StandardTypedV1 } from "@zap-studio/validation";
```

## Using with `@zap-studio/monads`

This package has no dependency on `@zap-studio/monads` — nothing is added to your
bundle unless you install it yourself. If you want a `Result` instead of throw/catch,
wrap the `throwOnError: true` variant with `@zap-studio/monads`'s `fromThrowable` (sync)
or `fromPromise` (async):

```ts
import { fromPromise, fromThrowable } from "@zap-studio/monads";
import { standardValidate, standardValidateSync } from "@zap-studio/validation";

// Sync — fromThrowable wraps a function directly.
const safeValidateSync = fromThrowable(standardValidateSync);
const result = safeValidateSync(input, schema, { throwOnError: true });

// Async — fromPromise wraps an already-created promise, mapping any
// rejection (a ValidationError, or a schema throw) into your error type.
const resultAsync = fromPromise(
  standardValidate(input, schema, { throwOnError: true }),
  (error) => error,
);
```

## Runtime Support

| Runtime            | Minimum version                                  |
| ------------------ | ------------------------------------------------ |
| Node.js            | 18.0.0                                           |
| Bun                | 1.0.0                                            |
| Deno               | 1.42                                             |
| Cloudflare Workers | Any current release                              |
| Browsers           | Latest evergreen (Chrome, Edge, Firefox, Safari) |

The package ships standard ESM only and uses no runtime-specific APIs. Deno 1.42 is the first release that can install packages from JSR (`deno add jsr:@zap-studio/validation`).

## License

MIT
