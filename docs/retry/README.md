# @zap-studio/retry

`retry` gives you reusable retry policies and a built-in runner so you can add resilient retries to async operations without rewriting orchestration loops.

## Motivation

A hand-written retry loop is usually a `for` loop with `setTimeout`, and it is easy to get wrong in ways that only show up under load. Without jitter, every client that lost connection to a service retries at the exact same moment once it comes back, causing a new spike right when the service is trying to recover.

Without cancellation, a retry loop can keep running — and keep hitting the network — after the result is no longer needed, for example after a user navigates away.

`retry` gives you this behavior as a built-in option, instead of something you write from scratch. `exponentialBackoff` and `linearBackoff` support jitter (`"full"` or `"equal"`, the same strategies AWS recommends) through the `jitter` option — turn it on and delays are randomized instead of fixed.

Every retry loop also accepts an `AbortSignal`, checked before each attempt and while waiting between attempts, so an abort stops the next attempt or delay from starting; it does not interrupt an attempt that is already running. You get retry policies as values you configure once and reuse, instead of logic you have to get right from scratch in every project.

## Features

- **Built-in policies**: [`fixedDelay(...)`](fixed-delay.md), [`linearBackoff(...)`](linear-backoff.md), and [`exponentialBackoff(...)`](exponential-backoff.md).
- **[Jitter](jitter.md)**: `"full"` or `"equal"` jitter on `exponentialBackoff`/`linearBackoff`, to avoid synchronized retries against a shared upstream.
- **A shared runner** via [`runRetryPolicy(policy, execute, options?)`](running-policies.md) with attempt-aware callbacks and custom sleep injection.
- **Structured terminal errors**: [`RetryError` on exhaustion, `AbortError` on cancellation](errors.md).
- **Non-throw mode** ([`throwOnExhausted: false`](non-throw-mode.md)) returns a `RetryRunResult` instead of throwing.
- **Cancellation** through [`AbortSignal`](abort-signal.md), checked before, between, and during retries.
- **Custom policies** as [plain objects implementing `RetryPolicy`](custom-policies.md) — just a `next(...)` function, no subclassing.
- **[Optional logging](logging.md)** via a `logger?: Logger` option from [`logger`](../logger/README.md) — omit it and there's zero logging overhead.
- **[Native OpenTelemetry](opentelemetry.md)** — retry decisions as events on the caller's active span, plus a `retry.attempts` counter, no-op until an SDK is registered.
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

## Runtime Support

| Runtime            | Minimum version                         |
| ------------------ | --------------------------------------- |
| Node.js            | 18.0.0                                  |
| Bun                | 1.0.0                                   |
| Deno               | 1.42                                    |
| Cloudflare Workers | Any current release                     |
| Browsers           | Chrome/Edge 98, Firefox 97, Safari 15.4 |

Cancellation relies on `AbortSignal.reason`, which sets the browser minimums above. Deno 1.42 is the first release that can install packages from JSR (`deno add jsr:@zap-studio/retry`).

## Learn More

- [Getting Started](getting-started.md) — install and build your first retry policy step by step
- [Built-in Policies: fixedDelay](fixed-delay.md)
- [Built-in Policies: linearBackoff](linear-backoff.md)
- [Built-in Policies: exponentialBackoff](exponential-backoff.md)
- [Jitter](jitter.md)
- [Shared Runner](running-policies.md)
- [Non-throw Mode](non-throw-mode.md)
- [Structured Errors](errors.md)
- [Cancellation](abort-signal.md)
- [Custom Policies](custom-policies.md)
- [Logging](logging.md)
- [OpenTelemetry](opentelemetry.md)
