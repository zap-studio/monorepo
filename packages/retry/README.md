# @zap-studio/retry

Composable retry policy primitives for HTTP clients and async workflows.

Full documentation: [zapstudio.dev/retry](https://www.zapstudio.dev/retry)

## Features

- **Built-in policies**: `FixedDelay` and `ExponentialBackoff`.
- **A shared runner** via `BaseRetryPolicy.run(...)` with attempt-aware callbacks and custom sleep injection.
- **Structured terminal errors**: `RetryError` on exhaustion, `AbortError` on cancellation.
- **Non-throw mode** (`throwOnExhausted: false`) returns a `RetryRunResult` instead of throwing.
- **Cancellation** through `AbortSignal`, checked before, between, and during retries.
- **Custom policies** by extending `BaseRetryPolicy` and implementing `next(...)`.

## Quick Start

```ts
import { ExponentialBackoff } from "@zap-studio/retry";
import { $fetch } from "@zap-studio/fetch";

const exponential = new ExponentialBackoff({
  maxAttempts: 5,
  baseDelayMs: 100,
  maxDelayMs: 2_000,
});

const data = await exponential.run(async () => {
  const response = await $fetch("https://api.example.com/users", {
    throwOnFetchError: true,
  });
  return await response.json();
});
```

## Built-in Policies

`FixedDelay` and `ExponentialBackoff`.

```ts
import { ExponentialBackoff, FixedDelay } from "@zap-studio/retry";

const exponential = new ExponentialBackoff({
  maxAttempts: 5,
  baseDelayMs: 100,
  maxDelayMs: 2_000,
});
const fixed = new FixedDelay({ maxAttempts: 4, delayMs: 300 });
```

## Shared Runner

Via `BaseRetryPolicy.run(...)` with attempt-aware callbacks and custom sleep injection.

```ts
await policy.run(execute, {
  sleep: (delayMs) => customSleep(delayMs),
});
```

## Structured Terminal Errors

`RetryError` on exhaustion, `AbortError` on cancellation.

```ts
import { AbortError, RetryError } from "@zap-studio/retry";

try {
  await policy.run(execute);
} catch (error) {
  if (error instanceof RetryError) console.error(error.attempts, error.lastError);
  if (error instanceof AbortError) console.error(error.message);
}
```

## Non-throw Mode

`throwOnExhausted: false` returns a `RetryRunResult` instead of throwing.

```ts
const result = await policy.run(execute, { throwOnExhausted: false });

if (!result.ok) {
  console.error(result.error);
} else {
  console.log(result.value);
}
```

## Cancellation

Through `AbortSignal`, checked before, between, and during retries.

```ts
const controller = new AbortController();

const promise = policy.run(execute, { signal: controller.signal });

controller.abort(new Error("Request canceled"));
```

## Custom Policies

By extending `BaseRetryPolicy` and implementing `next(...)`.

```ts
import { BaseRetryPolicy } from "@zap-studio/retry";
import type { RetryDecision, RetryDecisionInput } from "@zap-studio/retry";

class LinearBackoff extends BaseRetryPolicy {
  constructor(
    private readonly maxAttempts: number,
    private readonly stepMs: number
  ) {
    super();
  }

  public next(input: RetryDecisionInput): RetryDecision {
    if (input.attempt >= this.maxAttempts) {
      return { shouldRetry: false, delayMs: 0, reason: "max-attempts-reached" };
    }
    return { shouldRetry: true, delayMs: input.attempt * this.stepMs, reason: "retry" };
  }
}
```

## Runtime Support

| Runtime            | Minimum version                         |
| ------------------ | ---------------------------------------- |
| Node.js            | 18.0.0                                  |
| Bun                | 1.0.0                                   |
| Deno               | 1.42                                    |
| Cloudflare Workers | Any current release                     |
| Browsers           | Chrome/Edge 98, Firefox 97, Safari 15.4 |

Cancellation relies on `AbortSignal.reason`, which sets the browser minimums above. Deno 1.42 is the first release that can install packages from JSR (`deno add jsr:@zap-studio/retry`).

## License

MIT
