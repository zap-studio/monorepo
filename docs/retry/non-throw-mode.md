# Non-throw Mode

`throwOnExhausted: false` returns a `RetryRunResult` instead of throwing.

```ts
const result = await runRetryPolicy(
  policy,
  async () => {
    return await doWork();
  },
  { throwOnExhausted: false },
);

if (result.ok) {
  console.log(result.value);
} else {
  console.error("Failed after", result.attempts, "attempts:", result.error);
}
```

On failure, `result.error` is a `RetryError` (retries exhausted, or a caught value the policy's `isKnownError` rejected as outside its error domain) or an `AbortError` (run canceled).

> [!NOTE]
> In result mode, `runRetryPolicy(...)` never throws for a failed `execute(...)` attempt — an `isKnownError`-rejected value is wrapped in a `RetryError` and returned on `result.error`, not thrown. See [Narrow the Error Domain](custom-policies.md#narrow-the-error-domain).

Aborting a run behaves the same way in this mode — see [Cancellation](abort-signal.md#non-throw-mode).

## See Also

- [Shared Runner](running-policies.md) — the default throw mode
- [Structured Errors](errors.md) — the `RetryError` and `AbortError` shapes
