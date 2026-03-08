# @zap-studio/validation Documentation

The `@zap-studio/validation` package provides utilities for validating values using the [**Standard Schema**](https://standardschema.dev/schema) specification. It simplifies validation workflows by offering a consistent API for both synchronous and asynchronous validation.

## Key Features

- **Validation Helpers**: Functions like `standardValidate` and `standardValidateSync` for async-safe and synchronous validation.
- **Reusable Validators**: Create reusable validation functions with `createStandardValidator` and `createSyncStandardValidator`.
- **Runtime Schema Detection**: Use `isStandardSchema` to check if a value conforms to the Standard Schema interface.
- **Custom Error Handling**: Validation failures throw a `ValidationError` with detailed issue information.
- **Type Re-exports**: The package re-exports the `StandardSchemaV1` type from `@standard-schema/spec` for convenience.

## Re-exported Types

The `@zap-studio/validation` package re-exports the `StandardSchemaV1` type from the `@standard-schema/spec` package. This allows you to use the Standard Schema type definitions directly without needing to install the `@standard-schema/spec` package separately.

```ts
import type { StandardSchemaV1 } from "@zap-studio/validation";
```

This is particularly useful when working with schemas that implement the Standard Schema specification.

## Example Usage

### Asynchronous Validation

```ts
import { standardValidate } from "@zap-studio/validation";

try {
  const user = await standardValidate(userSchema, input, {
    throwOnError: true,
  });

  console.log("Validation passed:", user);
} catch (error) {
  console.error("Validation failed:", error);
}
```

### Synchronous Validation

```ts
import { standardValidateSync } from "@zap-studio/validation";

const result = standardValidateSync(userSchema, input);

if (result.issues) {
  console.error(result.issues);
} else {
  console.log(result.value);
}
```

### Reusable Validators

#### Async Validator

```ts
import { createStandardValidator } from "@zap-studio/validation";

const validateUser = createStandardValidator(userSchema);
const result = await validateUser(input);

const user = await validateUser(input, { throwOnError: true });
```

#### Sync Validator

```ts
import { createSyncStandardValidator } from "@zap-studio/validation";

const validateUser = createSyncStandardValidator(userSchema);
const result = validateUser(input);

const user = validateUser(input, { throwOnError: true });
```

## Handling Validation Errors

When using the throwing mode, validation failures produce a `ValidationError`.

```ts
import { standardValidate, ValidationError } from "@zap-studio/validation";

try {
  await standardValidate(userSchema, input, {
    throwOnError: true,
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Validation issues:", error.issues);
  }
}
```

## Choosing the Right Helper

| Function                      | Use when                                                        |
| ----------------------------- | --------------------------------------------------------------- |
| `standardValidate`            | You want validation that works with both sync and async schemas |
| `standardValidateSync`        | You know the schema is synchronous                              |
| `createStandardValidator`     | You want a reusable async validator                             |
| `createSyncStandardValidator` | You want a reusable sync validator                              |
| `isStandardSchema`            | You need to safely detect schemas at runtime                    |