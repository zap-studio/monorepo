# @zap-studio/validation

Standard Schema utilities and `ValidationError` helpers.

## Why @zap-studio/validation?

When working with Standard Schema-compatible libraries (Zod, Valibot, ArkType, etc.), you often want:

- A **single error type** to represent validation failures.
- A **simple way to detect** whether a value is a Standard Schema.
- A **consistent helper** for validating data in both throwing and non-throwing modes.

`@zap-studio/validation` provides exactly that, and is used internally by `@zap-studio/fetch` and other Zap Studio runtime packages.

## Installation

```bash
pnpm add @zap-studio/validation
# or
npm install @zap-studio/validation
```

## Core Concepts

### ValidationError

`ValidationError` is a shared error type thrown when Standard Schema validation fails.

```ts
import { ValidationError } from "@zap-studio/validation/errors";

try {
  const value = await standardValidate(schema, data, true);
  console.log("Validated:", value);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Validation failed:", error.issues);
  }
}
```

### isStandardSchema

`isStandardSchema` is a type guard that tells you whether a value is a Standard Schema-compatible schema.

```ts
import { isStandardSchema } from "@zap-studio/validation";

if (isStandardSchema(schema)) {
  // TypeScript now knows `schema` is a StandardSchemaV1
  const result = await standardValidate(schema, data, true);
}
```

### standardValidate

`standardValidate` normalizes sync and async Standard Schema validation, and supports both throwing and non-throwing flows.

```ts
import { standardValidate } from "@zap-studio/validation";

// Throwing mode
const value = await standardValidate(schema, data, true);

// Non-throwing mode
const result = await standardValidate(schema, data, false);
if (result.issues) {
  console.error("Validation failed:", result.issues);
} else {
  console.log("Validation passed:", result.value);
}
```

### createSyncStandardValidator

`createSyncStandardValidator` builds a synchronous validator function from a Standard Schema schema. It calls `schema["~standard"].validate` and throws if the schema performs async validation (returns a Promise).

```ts
import { createSyncStandardValidator } from "@zap-studio/validation";

// Build a sync-only validator for a Standard Schema-compatible schema
const validateUser = createSyncStandardValidator(UserSchema);

const result = validateUser(data);
if (result.issues) {
  console.error("Validation failed:", result.issues);
} else {
  console.log("Validation passed:", result.value);
}
```


