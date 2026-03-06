# @zap-studio/validation

Utilities for validating values using the [**Standard Schema**](https://standardschema.dev/schema) specification.

This package provides small, focused helpers for running validation against any schema that implements the Standard Schema interface. It adds conveniences like:

- async-safe validation
- synchronous validation
- optional throwing behavior
- reusable validator functions

It works with any Standard Schema compatible library.

## Installation

```bash
npm install @zap-studio/validation
````

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
```

### Sync validator

```ts
import { createSyncStandardValidator } from "@zap-studio/validation";

const validateUser = createSyncStandardValidator(userSchema);
const result = validateUser(input);
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

---

## Standard Schema

This package works with any library that implements the **Standard Schema** specification.

Standard Schema provides a common validation interface across multiple libraries.

Learn more: [https://github.com/standard-schema/standard-schema](https://github.com/standard-schema/standard-schema)

## License

MIT
