# @zap-studio/validation

Standard Schema utilities and helpers.

## Why @zap-studio/validation?

When you validate data with different Standard Schema-compatible libraries (Zod, Valibot, ArkType, etc.), it is easy to end up with slightly different patterns for checking schemas and handling validation errors.

`@zap-studio/validation` provides a small, focused set of helpers that give you:

- A single `ValidationError` type to represent schema validation failures.
- A type-safe `isStandardSchema` guard to detect Standard Schema-compatible schemas.
- A `standardValidate` helper that normalizes sync/async validation and error handling.

## Installation

```bash
pnpm add @zap-studio/validation
# or
npm install @zap-studio/validation
```

## Quick Start

```ts
import { z } from "zod";
import {
  isStandardSchema,
  standardValidate,
} from "@zap-studio/validation";
import { ValidationError } from "@zap-studio/validation/errors";

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
});

// Type guard for Standard Schema-compatible schemas
if (!isStandardSchema(UserSchema)) {
  throw new Error("Schema is not Standard Schema-compatible");
}

try {
  // Throwing mode
  const user = await standardValidate(UserSchema, data, true);
  console.log(user.email);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Validation failed:", error.issues);
  }
}

// Non-throwing mode
const result = await standardValidate(UserSchema, data, false);
if (result.issues) {
  console.error("Validation failed:", result.issues);
} else {
  console.log("Validation passed:", result.value);
}
```


