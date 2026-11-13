# Synchronous Validation

`standardValidateSync` is for schemas known to validate synchronously — use it only when validation must remain synchronous end-to-end, for example in sync-only code paths or constrained runtimes.

```ts
import { standardValidateSync } from "@zap-studio/validation";
import { z } from "zod";

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const result = standardValidateSync(input, userSchema);

if (result.issues) {
  console.error("Validation failed", result.issues);
} else {
  console.log("Validation passed", result.value);
}
```

It supports the same `throwOnError` option as [`standardValidate`](async-validation.md):

```ts
const user = standardValidateSync(input, userSchema, {
  throwOnError: true,
});
```

> [!WARNING]
> **Async Schemas**
>
> If the schema validates asynchronously, `standardValidateSync` throws a `TypeError` with the message `Async schemas are not supported by standardValidateSync`.

> [!TIP]
> Prefer [`standardValidate`](async-validation.md) by default. It is the most compatible option because it supports both sync and async schemas.

## See Also

- [Async Validation](async-validation.md) — the default choice, works with sync and async schemas
- [Create Validators](create-validators.md) — `createStandardValidatorSync` for a reusable sync validator
- [Errors](errors.md) — `throwOnError` and `ValidationError`
