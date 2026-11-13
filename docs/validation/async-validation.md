# Async Validation

`standardValidate` is async-safe validation that works with sync and async schemas — the default choice for most applications since it covers both cases with one API.

```ts
import { standardValidate } from "@zap-studio/validation";
import { z } from "zod";

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const result = await standardValidate(input, userSchema);

if (result.issues) {
  console.error("Validation failed", result.issues);
} else {
  console.log("Validation passed", result.value);
}
```

By default it does not throw — it returns the raw Standard Schema result: an object with either `value` (success) or `issues` (failure).

## Throwing Mode

Pass `throwOnError: true` when invalid input should stop execution. The helper then returns the parsed value directly and throws a `ValidationError` on failure.

```ts
const user = await standardValidate(input, userSchema, {
  throwOnError: true,
});

console.log(user.name); // typed as the schema's output
```

See [Errors](errors.md) for how to catch and inspect `ValidationError`.

## See Also

- [Synchronous Validation](synchronous-validation.md) — when validation must stay sync end-to-end
- [Create Validators](create-validators.md) — bind a schema once and reuse the validator
- [Errors](errors.md) — `throwOnError` and `ValidationError`
