# @zap-studio/retry

Composable retry policy primitives for HTTP clients and async workflows.

Full documentation: [zapstudio.dev/retry](https://www.zapstudio.dev/retry)

## Motivation

A hand-written retry loop is usually a `for` loop with `setTimeout`, and it is easy to get wrong in ways that only show up under load. Without jitter, every client that lost connection to a service retries at the exact same moment once it comes back, causing a new spike right when the service is trying to recover.

Without cancellation, a retry loop can keep running — and keep hitting the network — after the result is no longer needed, for example after a user navigates away.

`@zap-studio/retry` gives you this behavior as a built-in option, instead of something you write from scratch. `exponentialBackoff` and `linearBackoff` support jitter (`"full"` or `"equal"`, the same strategies AWS recommends) through the `jitter` option — turn it on and delays are randomized instead of fixed.

Every retry loop also accepts an `AbortSignal`, checked before each attempt and while waiting between attempts, so an abort stops the next attempt or delay from starting; it does not interrupt an attempt that is already running. You get retry policies as values you configure once and reuse, instead of logic you have to get right from scratch in every project.

## Installation

```bash
npm install @zap-studio/retry
```

## Features

- **Built-in policies**: `fixedDelay(...)`, `linearBackoff(...)`, and `exponentialBackoff(...)`.
- **Jitter**: `"full"` or `"equal"` jitter on `exponentialBackoff`/`linearBackoff`, to avoid synchronized retries against a shared upstream.
- **A shared runner** via `runRetryPolicy(policy, execute, options?)` with attempt-aware callbacks and custom sleep injection.
- **Structured terminal errors**: `RetryError` on exhaustion, `AbortError` on cancellation.
- **Non-throw mode** (`throwOnExhausted: false`) returns a `RetryRunResult` instead of throwing.
- **`Result`-returning variant** via `runRetryPolicyResult(policy, execute, options?)`, for explicit error handling with [`@zap-studio/monads`](https://www.npmjs.com/package/@zap-studio/monads) instead of throw/catch.
- **Cancellation** through `AbortSignal`, checked before, between, and during retries.
- **Custom policies** as plain objects implementing `RetryPolicy` — just a `next(...)` function, no subclassing.
- **Optional logging** via a `logger?: Logger` option ([`@zap-studio/logger`](https://www.npmjs.com/package/@zap-studio/logger)) — omit it and there's zero logging overhead.
- **Tree-shakeable** — policies are functions returning plain objects, not classes; unused policies are dropped by any modern bundler.

## Quick Start

```ts
import { ConsoleLogger } from "@zap-studio/logger";
import { exponentialBackoff, runRetryPolicy } from "@zap-studio/retry";
import { $fetch } from "@zap-studio/fetch";

const logger = new ConsoleLogger({ minLevel: "debug" });

const policy = exponentialBackoff({
  maxAttempts: 5,
  baseDelayMs: 100,
  maxDelayMs: 2_000,
});

const data = await runRetryPolicy(
  policy,
  async () => {
    const response = await $fetch("https://api.example.com/users", {
      throwOnFetchError: true,
    });
    return await response.json();
  },
  { logger },
);
```

## Built-in Policies

`fixedDelay(...)`, `linearBackoff(...)`, and `exponentialBackoff(...)`.

```ts
import { exponentialBackoff, fixedDelay, linearBackoff } from "@zap-studio/retry";

const exponential = exponentialBackoff({
  maxAttempts: 5,
  baseDelayMs: 100,
  maxDelayMs: 2_000,
});
const linear = linearBackoff({
  maxAttempts: 5,
  baseDelayMs: 100,
  incrementMs: 100,
  maxDelayMs: 2_000,
});
const fixed = fixedDelay({ maxAttempts: 4, delayMs: 300 });
```

## Jitter

`"full"` or `"equal"` jitter on `exponentialBackoff`/`linearBackoff`, applied to the delay after it's capped, to avoid synchronized retries against a shared upstream.

```ts
const policy = exponentialBackoff({
  maxAttempts: 5,
  baseDelayMs: 100,
  maxDelayMs: 2_000,
  jitter: "full",
});
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
  if (error instanceof RetryError) console.error(error.attempts, error.lastError);
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

## Result-Returning Variant

`runRetryPolicyResult(policy, execute, options?)` — additive alternative to `runRetryPolicy` for consumers who prefer explicit [`Result`](https://www.zapstudio.dev/monads/result)/[`ResultAsync`](https://www.zapstudio.dev/monads/result-async) values over throw/catch. There's no `throwOnExhausted` option — it always returns a `Result`.

```ts
import { isOk } from "@zap-studio/monads";
import { runRetryPolicyResult } from "@zap-studio/retry";

const result = await runRetryPolicyResult(policy, execute);

if (isOk(result)) {
  console.log(result.value);
} else {
  console.error(result.error); // RetryError | AbortError, same as runRetryPolicy's throw mode
}
```

For exhaustion and cancellation, `Err` contains the same `RetryError`/`AbortError` object `runRetryPolicy`'s throw mode would throw — `RetryError.attempts`/`lastError`/`lastData` and `AbortError.cause` are preserved. A value rejected by `policy.isKnownError` is instead wrapped in a new `RetryError`, because throw mode rethrows that value as-is.

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
import type { RetryDecision, RetryDecisionInput, RetryPolicy } from "@zap-studio/retry";

const stepDelay = (maxAttempts: number, stepMs: number): RetryPolicy => ({
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

const data = await runRetryPolicy(stepDelay(5, 100), execute);
```

## Logging

Pass a `logger?: Logger` from [`@zap-studio/logger`](https://www.npmjs.com/package/@zap-studio/logger) to `runRetryPolicy(...)` to observe retry decisions, exhaustion, and cancellation. Omit it and nothing is logged.

```ts
import { ConsoleLogger } from "@zap-studio/logger";
import { exponentialBackoff, runRetryPolicy } from "@zap-studio/retry";

const logger = new ConsoleLogger({ minLevel: "debug" });
const policy = exponentialBackoff({ maxAttempts: 5, baseDelayMs: 100 });

await runRetryPolicy(policy, execute, { logger });
```

Each retry decision logs at `debug` (attempt, delay, reason), exhaustion logs at `warn`, and cancellation logs at `debug`.

## OpenTelemetry

`@opentelemetry/api` is a required peer dependency — tiny, side-effect-free, and a no-op until an app registers a real SDK, so installing it costs nothing at runtime for consumers who never set one up.

Unlike `fetch`, `webhooks`, and `permit`, this package never creates its own span — a retry loop wraps someone else's operation, so each decision is recorded as an **event** on whatever span is already active (e.g. a caller's `fetch` span), plus a `retry.attempts` counter tagged by outcome:

```bash
npm install @opentelemetry/api
```

```ts
import { exponentialBackoff, runRetryPolicy } from "@zap-studio/retry";

const policy = exponentialBackoff({ maxAttempts: 5, baseDelayMs: 100 });

// If a span is active when this runs (e.g. inside a caller's own span, or
// nested inside a @zap-studio/fetch call), each retry adds a
// "retry.scheduled" or "retry.exhausted" event to it. If not, it's a no-op
// — no wiring required either way.
await runRetryPolicy(policy, execute);
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
