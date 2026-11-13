# @zap-studio/logger

`logger` gives `@zap-studio/*` packages (and your own code) an optional, pluggable way to emit logs — one interface, one console-backed implementation, with next to no dependency weight.

## Motivation

Libraries like `winston` and `pino` are built for Node servers, with file transports and streams. They do not run well — or at all — on Cloudflare Workers or in the browser.

This becomes a problem for small libraries that want to add logging: if a retry library or an HTTP client hard-depends on `winston`, every user of that library must install `winston`, even if they do not want logging, and even if their code runs somewhere `winston` does not.

`logger` avoids this by shipping an interface, not an implementation. `Logger` is a small type with six methods (`trace`, `debug`, `info`, `warn`, `error`, `fatal`). Most `@zap-studio/*` packages that talk to the outside world — `fetch`, `permit`, `retry`, `webhooks` — accept an optional `logger: Logger`.

Pass nothing, and there is no dependency and no runtime cost. Pass `ConsoleLogger`, and you get leveled, formatted output that works on Node, Bun, Deno, browsers, and Cloudflare Workers with no setup.

Already use `pino`? It already exposes the same six methods, so it works as a `Logger` with no adapter code needed.

## Features

- **One interface**: [`Logger`](getting-started.md) — `trace`/`debug`/`info`/`warn`/`error`/`fatal`, each `(message: string, context?: Record<string, unknown>) => void`.
- **One implementation**: [`ConsoleLogger`](getting-started.md), backed by the global `console` object, with a configurable `minLevel` to control verbosity.
- **[Pluggable output formats](formats.md)**: `classicFormat` (default), `jsonFormat`, `compactFormat`, `prettyFormat` — pass any function matching `LogFormatter`, no registration required.
- **Minimal dependencies, tree-shakeable** — [`@opentelemetry/api`](opentelemetry.md) is the only peer dependency, tiny and a no-op until you register an SDK; unused exports are dropped by any modern bundler.
- **Optional by design** — other `@zap-studio/*` packages accept a `logger?: Logger` option; omit it and there's zero logging overhead.
- **[Runtime-agnostic, zero config](runtime-compatibility.md)** — works out of the box on Node.js, Bun, Deno, browsers, and Cloudflare Workers.
- **[Automatic trace-log correlation](opentelemetry.md)** — `ConsoleLogger` stamps the active span's `trace_id`/`span_id` onto every log call, no-op until an SDK is registered.

## Quick Start

```ts
import { ConsoleLogger } from "@zap-studio/logger";

const logger = new ConsoleLogger({ minLevel: "debug" });

logger.debug("cache miss", { key: "user:42" });
logger.warn("retrying after failure", { attempt: 2 });
```

## Runtime Compatibility

Works out of the box on Node.js, Bun, Deno, browsers, and Cloudflare Workers — no configuration needed. See [Runtime Compatibility](runtime-compatibility.md) for how `prettyFormat`'s color detection adapts per runtime.

## Runtime Support

| Runtime            | Minimum version                         |
| ------------------ | --------------------------------------- |
| Node.js            | 18.0.0                                  |
| Bun                | 1.0.0                                   |
| Deno               | 1.42                                    |
| Cloudflare Workers | Any current release                     |
| Browsers           | Chrome/Edge 98, Firefox 97, Safari 15.4 |

Deno 1.42 is the first release that can install packages from JSR (`deno add jsr:@zap-studio/logger`).

## Learn More

- [Getting Started](getting-started.md) — install and use `ConsoleLogger`, and see how to implement `Logger` for a custom backend
- [Output Formats](formats.md) — `classicFormat`, `jsonFormat`, `compactFormat`, `prettyFormat`, and writing your own
- [Runtime Compatibility](runtime-compatibility.md) — how the package adapts automatically to each runtime
- [OpenTelemetry](opentelemetry.md) — automatic trace-log correlation
