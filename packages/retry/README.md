# @zap-studio/retry

Composable retry policy primitives for HTTP clients and async workflows.

## Installation

```bash
nub add @zap-studio/retry
# or
npm install @zap-studio/retry
# or
pnpm add @zap-studio/retry
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

## Usage

```ts
import { ExponentialBackoff, FixedDelay } from "@zap-studio/retry";
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

## Handling Errors

`run(...)` throws when retries are exhausted.

By default, policies extending `BaseRetryPolicy` throw `RetryError` on exhaustion and `AbortError` on cancellation.

```ts
import { AbortError, RetryError } from "@zap-studio/retry";

try {
  const data = await exponential.run(async () => {
    const response = await $fetch("https://api.example.com/users", {
      throwOnFetchError: true,
    });
    return await response.json();
  });
  console.log(data);
} catch (error) {
  if (error instanceof RetryError) {
    console.error("Retries exhausted:", error.attempts);
    console.error("Last error:", error.lastError);
  } else if (error instanceof AbortError) {
    console.error("Retry aborted:", error.message);
  } else {
    throw error;
  }
}
```

To handle exhaustion without throwing, pass `throwOnExhausted: false`:

```ts
const result = await exponential.run(
  async () => {
    const response = await $fetch("https://api.example.com/users", {
      throwOnFetchError: true,
    });
    return await response.json();
  },
  { throwOnExhausted: false }
);

if (!result.ok) {
  console.error("Retries exhausted:", result.attempts);
  console.error("Last error:", result.error.lastError);
} else {
  console.log(result.value);
}
```

## Default sleep

`BaseRetryPolicy.run` automatically applies a delay between retry attempts when no custom `sleep` function is provided in the options.

That default is the `defaultSleep` helper, exported from `@zap-studio/retry`.

By default, this delay mechanism relies on the native JavaScript `setTimeout`, meaning retries are scheduled using the standard event loop timing rather than any custom or blocking implementation.

## Cancellation With AbortSignal

Use `signal` in `run(...)` options to stop retrying early.

```ts
const controller = new AbortController();

const promise = exponential.run(
  async () => {
    const response = await $fetch("https://api.example.com/users", {
      throwOnFetchError: true,
    });
    return await response.json();
  },
  { signal: controller.signal }
);

controller.abort(new Error("Request canceled"));

await promise;
```

In non-throw mode, abort is returned as `{ ok: false }` with `AbortError` on `result.error`:

```ts
const controller = new AbortController();

const result = await exponential.run(
  async () => {
    const response = await $fetch("https://api.example.com/users", {
      throwOnFetchError: true,
    });
    return await response.json();
  },
  {
    signal: controller.signal,
    throwOnExhausted: false,
  }
);

if (!result.ok) {
  console.error("Retry stopped:", result.error);
}
```

## Choosing The Right Policy

Use `ExponentialBackoff` for transient network instability and shared upstream services.

```ts
const unstableNetworkPolicy = new ExponentialBackoff({
  maxAttempts: 6,
  baseDelayMs: 100,
  maxDelayMs: 2_000,
});
```

Use `FixedDelay` for stable, predictable retry intervals in controlled environments.

```ts
const predictableIntervalPolicy = new FixedDelay({
  maxAttempts: 4,
  delayMs: 300,
});
```

## Custom Policies

Extend `BaseRetryPolicy` when the built-in policies do not match your retry rules.

You implement `next(...)` only; the base class supplies `onExhausted` with a default `RetryError` and keeps the shared `run(...)` orchestration (override `onExhausted` when you need a different terminal error).

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
      return {
        shouldRetry: false,
        delayMs: 0,
        reason: "max-attempts-reached",
      };
    }

    return {
      shouldRetry: true,
      delayMs: input.attempt * this.stepMs,
      reason: "retry",
    };
  }
}

const policy = new LinearBackoff(5, 250);
const value = await policy.run(doWork);
```

## RetryError

Use `RetryError` when an orchestrator exhausts retries and needs to surface final context.

```ts
import { RetryError } from "@zap-studio/retry";

throw new RetryError("Retry policy exhausted all attempts.", {
  attempts: attempt,
  lastError: error,
  lastData: data,
});
```

Policies implement `onExhausted(input)` to return the terminal error used by the built-in runner.

`ExponentialBackoff` and `FixedDelay` inherit the default implementation from `BaseRetryPolicy`.

## License

MIT
