# OpenTelemetry

`@opentelemetry/api` is a required peer dependency of `@zap-studio/env`. It's a tiny, side-effect-free package that's a no-op until an app registers a real SDK, so installing it costs nothing at runtime for consumers who never set one up.

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
import { createEnvironment } from "@zap-studio/env";
import { z } from "zod";

// If your app has registered an OpenTelemetry SDK, this call now produces a
// span. If not, it does nothing. No extra setup is needed either way.
export const env = createEnvironment({
  server: { PORT: z.coerce.number() },
  runtimeEnv: process.env,
});
```

## The `env.validate` Span

Each `createEnvironment` validation pass gets an `INTERNAL` span named `env.validate`. On failure, the span carries the invalid key names — never their values — as the `env.invalid_keys` attribute, and is marked as an error, with the thrown error recorded via `recordException`.

Validation itself runs once at startup, not per-request, so the span cost is negligible.

## Skipped Validation, No Span

When [`skipValidation`](advanced-options.md#skipvalidation) is `true`, `createEnvironment` returns early before the `env.validate` span is created — there's nothing to trace, since no validation actually runs.

## Log Correlation

Pair this with [`logger`](../logger/opentelemetry.md): once a span is active, `ConsoleLogger` automatically stamps `trace_id`/`span_id` onto every log line, so anything you log around startup lines up with the `env.validate` span.

## See Also

- [Errors](errors.md) — `EnvironmentValidationError`, whose `invalidKeys` end up on the span
- [Advanced Options](advanced-options.md) — `skipValidation` and when the span is skipped
