# fixedDelay

`fixedDelay(...)` creates a policy that retries with the same delay before every retry until `maxAttempts` is reached.

## Import

```ts
import { fixedDelay } from "@zap-studio/retry";
```

## Configuration

```ts
import { fixedDelay } from "@zap-studio/retry";

const policy = fixedDelay({
  maxAttempts: 4,
  delayMs: 300,
});
```

| Option        | Type     | Default | Description                                                        |
| ------------- | -------- | ------- | ------------------------------------------------------------------ |
| `maxAttempts` | `number` | —       | Maximum number of attempts (including the first) before giving up. |
| `delayMs`     | `number` | —       | Constant delay in milliseconds before each retry after a failure.  |

Both options are required.

## Behavior

- Every retry waits the same `delayMs`.
- The policy stops retrying when `attempt >= maxAttempts`, returning a decision with `reason: "max-attempts-reached"`.
- On exhaustion, `runRetryPolicy(...)` throws a [`RetryError`](errors.md) (or returns `{ ok: false }` in [non-throw mode](non-throw-mode.md)).

## When to Use

Use `fixedDelay` when:

- your backend has predictable recovery windows
- you want straightforward, constant retry timing
- you need easy-to-debug behavior in tests

For shared or unstable upstream services, prefer [`exponentialBackoff`](exponential-backoff.md) so retries back off instead of hammering the service.

## Example

```ts
import { fixedDelay, runRetryPolicy } from "@zap-studio/retry";

const policy = fixedDelay({
  maxAttempts: 3,
  delayMs: 250,
});

const value = await runRetryPolicy(policy, async () => {
  const response = await fetch("https://api.example.com/config");
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return await response.json();
});
```
