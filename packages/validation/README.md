# @zap-studio/validation

Utilities for validating values using the [**Standard Schema**](https://standardschema.dev/schema) specification.

Full documentation: [zapstudio.dev/validation](https://www.zapstudio.dev/validation)

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

## Quick Start

```ts
import { standardValidate } from "@zap-studio/validation";

// `userSchema` can come from any Standard Schema-compatible library
try {
  const user = await standardValidate(userSchema, input, {
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

const result = standardValidateSync(userSchema, input);
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
  await standardValidate(userSchema, input, { throwOnError: true });
} catch (error) {
  if (error instanceof ValidationError) console.error(error.issues);
}
```

## Runtime Schema Detection

Via `isStandardSchema`.

```ts
import { isStandardSchema, standardValidate } from "@zap-studio/validation";

if (isStandardSchema(schemaLike)) {
  await standardValidate(schemaLike, input);
}
```

## Type Re-exports

`StandardSchemaV1` and `StandardTypedV1` directly from this package.

```ts
import type { StandardSchemaV1, StandardTypedV1 } from "@zap-studio/validation";
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
