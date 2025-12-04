---
"@zap-studio/fetch": patch
---

Add discriminated return types based on `throwOnValidationError` option

The return type of `$fetch` and `api.*` methods now correctly narrows based on the `throwOnValidationError` option:

- When `throwOnValidationError: true` (default) or unspecified: returns `Promise<TSchema>` (the validated data directly)
- When `throwOnValidationError: false`: returns `Promise<StandardSchemaV1.Result<TSchema>>` (the result object with `value` or `issues`)

This improves type safety by eliminating the need for manual type narrowing when using the default behavior.
