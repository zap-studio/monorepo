# @zap-studio/validation

Utilities for validating values using the [**Standard Schema**](https://standardschema.dev/schema) specification.

This package provides small, focused helpers for running validation against any schema that implements the Standard Schema interface. It adds conveniences like:

- async-safe validation
- synchronous validation
- optional throwing behavior
- reusable validator functions
- runtime schema detection via `isStandardSchema`
- type re-exports for Standard Schema: Use `StandardSchemaV1` directly from this package

It works with any Standard Schema compatible library.

## Installation

```bash
npm install @zap-studio/validation
```

## Quick Example

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

## Before

Without a shared Standard Schema helper, validation logic often becomes library-specific:

```ts
if (validatorLib === "zod") {
  const result = userSchema.safeParse(input);
  if (!result.success) throw result.error;
  return result.data;
}

if (validatorLib === "valibot") {
  const result = v.safeParse(userSchema, input);
  if (!result.success) throw result.issues;
  return result.output;
}
```

## After

With `@zap-studio/validation`, the calling code stays the same:

```ts
import { standardValidate } from "@zap-studio/validation";

// `userSchema` can come from any Standard Schema-compatible library
const user = await standardValidate(userSchema, input, {
  throwOnError: true,
});
```

## Non-throwing Validation

If you prefer not to use exceptions, you can receive the raw validation result.

```ts
import { standardValidate } from "@zap-studio/validation";

const result = await standardValidate(userSchema, input);

if (result.issues) {
  console.error("Validation failed:", result.issues);
} else {
  console.log("Validation passed:", result.value);
}
```

You can also explicitly disable throwing:

```ts
const result = await standardValidate(userSchema, input, {
  throwOnError: false,
});
```

## Synchronous Validation

If you know the schema performs synchronous validation, you can use the sync helper.

```ts
import { standardValidateSync } from "@zap-studio/validation";

const result = standardValidateSync(userSchema, input);

if (result.issues) {
  console.error(result.issues);
} else {
  console.log(result.value);
}
```

If the schema performs async validation, this function will throw.

## Reusable Validators

If you validate many values against the same schema, you can create reusable validators.

### Async validator

```ts
import { createStandardValidator } from "@zap-studio/validation";

const validateUser = createStandardValidator(userSchema);
const result = await validateUser(input);

const user = await validateUser(input, { throwOnError: true });
```

### Sync validator

```ts
import { createSyncStandardValidator } from "@zap-studio/validation";

const validateUser = createSyncStandardValidator(userSchema);
const result = validateUser(input);

const user = validateUser(input, { throwOnError: true });
```

## Runtime Schema Guard

Use `isStandardSchema` when a value might be a schema and you need to check it before validating.

```ts
import { isStandardSchema, standardValidate } from "@zap-studio/validation";

async function validateIfSchema(schemaLike: unknown, input: unknown) {
  if (!isStandardSchema(schemaLike)) return null;
  return standardValidate(schemaLike, input);
}
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

---

## Standard Schema

**Standard Schema** is a shared validation interface.

In practice, teams often choose different validation libraries:

- some teams use [Zod](https://zod.dev/)
- others use [ArkType](https://arktype.io/)
- others use [Valibot](https://valibot.dev/)

When those libraries implement the Standard Schema spec, you can keep one validation flow in your app instead of writing library-specific code paths.

`@zap-studio/validation` builds on that spec and gives you one consistent API for validation and error handling (`isStandardSchema`, `standardValidate`, `standardValidateSync`, `createStandardValidator`, `createSyncStandardValidator`, `ValidationError`).

In addition to providing validation utilities, the `@zap-studio/validation` package re-exports the `StandardSchemaV1` type from the `@standard-schema/spec` package. This allows you to use the Standard Schema type definitions directly without needing to install the `@standard-schema/spec` package separately.

```ts
import type { StandardSchemaV1 } from "@zap-studio/validation";
```

This is particularly useful when working with schemas that implement the Standard Schema specification.

At Zap Studio, we use this package internally across other packages so they stay compatible with any validation library that supports the Standard Schema spec.

Learn more: [https://github.com/standard-schema/standard-schema](https://github.com/standard-schema/standard-schema)

## License

MIT
