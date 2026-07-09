---
name: zap-validation-standard-schema
description: Use @zap-studio/validation in an application or library. Use when validating unknown data with Standard Schema, standardValidate, standardValidateSync, createStandardValidator, createSyncStandardValidator, isStandardSchema, ValidationError, throwOnError modes, sync-vs-async schemas, or shared validation across Zod, Valibot, ArkType, and other Standard Schema libraries.
---

# Zap Validation Standard Schema

Use this skill when consuming `@zap-studio/validation`.

## Choose the Right Helper

| Helper | Use when |
| --- | --- |
| `standardValidate` | Schema may validate sync or async; caller can await |
| `standardValidateSync` | Schema is known to be synchronous |
| `createStandardValidator` | Reusing one async validator many times |
| `createSyncStandardValidator` | Reusing one sync validator many times |
| `isStandardSchema` | Guarding unknown schema-like inputs |

## Return Modes

Default mode returns the raw Standard Schema result.

```ts
const result = await standardValidate(UserSchema, input);

if (result.issues) {
  return { ok: false, issues: result.issues };
}

return { ok: true, value: result.value };
```

Throw mode returns the parsed value or throws `ValidationError`.

```ts
import { standardValidate } from "@zap-studio/validation";
import { ValidationError } from "@zap-studio/validation/errors";

try {
  const user = await standardValidate(UserSchema, input, {
    throwOnError: true,
  });
  return user;
} catch (error) {
  if (error instanceof ValidationError) return { issues: error.issues };
  throw error;
}
```

## Sync Schema Rules

Use sync helpers only when the schema does not return a Promise.

```ts
const result = standardValidateSync(UserSchema, input);
```

If a sync helper receives an async schema result, it throws:

- `standardValidateSync`: `Async schemas are not supported by standardValidateSync`
- `createSyncStandardValidator`: `Async schemas are not supported by createSyncStandardValidator`

## Usage Guidance

- Preserve overloads that distinguish `throwOnError: true` from false/omitted mode.
- Runtime-invalid schema objects can throw `TypeError` when `~standard.validate` is missing or not callable.
- `ValidationError.message` is the pretty JSON representation of issues; use `issues` for structured handling.
- Use `isStandardSchema` before validating schema-like user/plugin inputs.
- Use async helpers by default unless the schema is guaranteed synchronous.

## References

- Package docs: https://zapstudio.dev/packages/validation
- llms.txt: https://zapstudio.dev/llms.txt
- llms-full.txt: https://zapstudio.dev/llms-full.txt
