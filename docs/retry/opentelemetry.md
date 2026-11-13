# OpenTelemetry

`@opentelemetry/api` is a required peer dependency of `@zap-studio/retry`. It's a tiny, side-effect-free package that's a no-op until an app registers a real SDK, so installing it costs nothing at runtime for consumers who never set one up — the same deal [`logger?`](logging.md) already gives.

```bash
# npm
npm install @opentelemetry/api
# yarn
yarn add @opentelemetry/api
# pnpm
pnpm add @opentelemetry/api
# bun
bun add @opentelemetry/api
# deno
deno add npm:@opentelemetry/api
```

There's no option to configure — instrumentation is always on, and does nothing observable until your app registers an OpenTelemetry SDK:

```ts
import { exponentialBackoff, runRetryPolicy } from "@zap-studio/retry";

const policy = exponentialBackoff({ maxAttempts: 5, baseDelayMs: 100 });

await runRetryPolicy(policy, execute);
```

## Span Events, Not a Span

Unlike [`fetch`](../fetch/opentelemetry.md), [`webhooks`](../webhooks/opentelemetry.md), and [`permit`](../permit/opentelemetry.md), this package never creates its own span. A retry loop wraps someone else's operation — usually a network call that's already producing its own span — so a whole extra span per attempt would just be noise nested inside that operation's span.

Instead, each retry decision is recorded as an **event** on whatever span is already active when the decision happens (for example, the `CLIENT` span from a `fetch` call being retried, or your own app-level span):

| Event             | When                        | Attributes                                  |
| ----------------- | --------------------------- | ------------------------------------------- |
| `retry.scheduled` | A retry will be attempted   | `attempt`, `retry.delay_ms`, `retry.reason` |
| `retry.exhausted` | No more retries will happen | `attempt`, `retry.reason`                   |

If no span is active, `addEvent` is a no-op — nothing to attach the event to, so nothing happens.

## Counter Metric

Every decision also increments a `retry.attempts` counter, tagged with `retry.decision: "retry" | "exhausted"`, independent of whether a span happens to be active. This is the metric to graph "how often are calls to this service retrying" without needing a trace backend.

## Log Correlation

Pair this with [`logger`](../logger/opentelemetry.md): once a span is active, `ConsoleLogger` automatically stamps `trace_id`/`span_id` onto every log line, so retry decisions logged via [the `logger` option](logging.md) line up with the events on the active span.
