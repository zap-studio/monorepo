# OpenTelemetry

`@opentelemetry/api` is a required peer dependency of `@zap-studio/logger`. It's a tiny, side-effect-free package that's a no-op until an app registers a real SDK, so installing it costs nothing at runtime for consumers who never set one up.

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

This is **not** a full bridge to the OTel Logs API — `Logger` already does that job well as its own abstraction, and duplicating it would be redundant. This is trace-log correlation: `ConsoleLogger` automatically stamps the active span's trace context onto every log call.

```ts
import { ConsoleLogger } from "@zap-studio/logger";

const logger = new ConsoleLogger();

logger.info("checkpoint", { userId: "u1" });
```

## What Gets Added

When a log call happens while a span is active, `trace_id` and `span_id` are merged into that call's context before formatting — so `jsonFormat`, `compactFormat`, and any custom formatter all see them like any other context field:

```json
{
  "userId": "u1",
  "trace_id": "4bf92f...",
  "span_id": "00f067...",
  "level": "info",
  "msg": "checkpoint"
}
```

If you pass an explicit `trace_id` or `span_id` in your own context, it wins — the active span's values only fill in what you didn't already provide.

If no span is active (no OpenTelemetry SDK registered, or the log call happens outside any span), nothing is added — the log looks exactly like it did before this feature existed.

## Pairing With Other Packages

[`fetch`](../fetch/opentelemetry.md), [`webhooks`](../webhooks/opentelemetry.md), and [`permit`](../permit/opentelemetry.md) create spans; [`retry`](../retry/opentelemetry.md) adds events to whichever span is already active. Pass a `ConsoleLogger` as those packages' `logger` option, and every log line they emit while a span is active carries that span's `trace_id`/`span_id` automatically — no extra wiring needed on top of what those packages' own [Logging](../fetch/logging.md) pages already show.
