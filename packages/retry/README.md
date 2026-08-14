# @zap-studio/retry

Composable retry policy primitives for HTTP clients and async workflows.

Full documentation: [zapstudio.dev/retry](https://www.zapstudio.dev/retry)

## Installation

```bash
npm install @zap-studio/retry
```

## Features

- **Built-in policies**: `fixedDelay(...)` and `exponentialBackoff(...)`.
- **A shared runner** via `runRetryPolicy(policy, execute, options?)` with attempt-aware callbacks and custom sleep injection.
- **Structured terminal errors**: `RetryError` on exhaustion, `AbortError` on cancellation.
- **Non-throw mode** (`throwOnExhausted: false`) returns a `RetryRunResult` instead of throwing.
- **Cancellation** through `AbortSignal`, checked before, between, and during retries.
- **Custom policies** as plain objects implementing `RetryPolicy` — just a `next(...)` function, no subclassing.
- **Tree-shakeable** — policies are functions returning plain objects, not classes; unused policies are dropped by any modern bundler.

## Quick Start

```ts
import { exponentialBackoff, runRetryPolicy } from "@zap-studio/retry";
import { $fetch } from "@zap-studio/fetch";

const policy = exponentialBackoff({
  maxAttempts: 5,
  baseDelayMs: 100,
  maxDelayMs: 2_000,
});

const data = await runRetryPolicy(policy, async () => {
  const response = await $fetch("https://api.example.com/users", {
    throwOnFetchError: true,
  });
  return await response.json();
});
```

## Built-in Policies

`fixedDelay(...)` and `exponentialBackoff(...)`.

```ts
import { exponentialBackoff, fixedDelay } from "@zap-studio/retry";

const exponential = exponentialBackoff({
  maxAttempts: 5,
  baseDelayMs: 100,
  maxDelayMs: 2_000,
});
const fixed = fixedDelay({ maxAttempts: 4, delayMs: 300 });
```

## Shared Runner

Via `runRetryPolicy(policy, execute, options?)` with attempt-aware callbacks and custom sleep injection.

```ts
await runRetryPolicy(policy, execute, {
  sleep: (delayMs) => customSleep(delayMs),
});
```

## Structured Terminal Errors

`RetryError` on exhaustion, `AbortError` on cancellation.

```ts
import { AbortError, RetryError, runRetryPolicy } from "@zap-studio/retry";

try {
  await runRetryPolicy(policy, execute);
} catch (error) {
  if (error instanceof RetryError)
    console.error(error.attempts, error.lastError);
  if (error instanceof AbortError) console.error(error.message);
}
```

## Non-throw Mode

`throwOnExhausted: false` returns a `RetryRunResult` instead of throwing.

```ts
const result = await runRetryPolicy(policy, execute, {
  throwOnExhausted: false,
});

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

const promise = runRetryPolicy(policy, execute, { signal: controller.signal });

controller.abort(new Error("Request canceled"));
```

## Custom Policies

As plain objects implementing `RetryPolicy` — just a `next(...)` function, no subclassing.

```ts
import { runRetryPolicy } from "@zap-studio/retry";
import type {
  RetryDecision,
  RetryDecisionInput,
  RetryPolicy,
} from "@zap-studio/retry";

const linearBackoff = (maxAttempts: number, stepMs: number): RetryPolicy => ({
  next(input: RetryDecisionInput): RetryDecision {
    if (input.attempt >= maxAttempts) {
      return { shouldRetry: false, delayMs: 0, reason: "max-attempts-reached" };
    }
    return {
      shouldRetry: true,
      delayMs: input.attempt * stepMs,
      reason: "retry",
    };
  },
});

const data = await runRetryPolicy(linearBackoff(5, 100), execute);
```

## Runtime Support

| Runtime            | Minimum version                         |
| ------------------ | --------------------------------------- |
| Node.js            | 18.0.0                                  |
| Bun                | 1.0.0                                   |
| Deno               | 1.42                                    |
| Cloudflare Workers | Any current release                     |
| Browsers           | Chrome/Edge 98, Firefox 97, Safari 15.4 |

Cancellation relies on `AbortSignal.reason`, which sets the browser minimums above. Deno 1.42 is the first release that can install packages from JSR (`deno add jsr:@zap-studio/retry`).

## License

MIT
