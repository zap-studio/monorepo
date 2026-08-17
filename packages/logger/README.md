# @zap-studio/logger

A lean logging abstraction: one `Logger` interface, one `ConsoleLogger` implementation.

Full documentation: [zapstudio.dev/logger](https://www.zapstudio.dev/logger)

## Installation

```bash
npm install @zap-studio/logger
```

## Features

- **One interface**: `Logger` — `trace`/`debug`/`info`/`warn`/`error`/`fatal`, each `(message: string, context?: Record<string, unknown>) => void`. Any object shaped like it works, no subclassing required.
- **One implementation**: `ConsoleLogger`, backed by the global `console` object, with a configurable `minLevel` to control verbosity.
- **Pluggable output formats**: `classicFormat` (default), `jsonFormat`, `compactFormat`, `prettyFormat` — pass any function matching `LogFormatter`, no registration required.
- **Zero dependencies, tree-shakeable** — unused exports are dropped by any modern bundler.
- **Optional by design** — other `@zap-studio/*` packages accept a `logger?: Logger` option; omit it and there's zero logging overhead.
- **Runtime-agnostic, zero config** — works out of the box on Node.js, Bun, Deno, browsers, and Cloudflare Workers.

## Quick Start

```ts
import { ConsoleLogger } from "@zap-studio/logger";

const logger = new ConsoleLogger({ minLevel: "debug" });

logger.debug("cache miss", { key: "user:42" });
logger.warn("retrying after failure", { attempt: 2 });
```

## Output Formats

`ConsoleLogger` accepts a `format?: LogFormatter` option, defaulting to `classicFormat` (today's `message` + `context` output). Built-in formatters, all from `@zap-studio/logger/format`:

```ts
import {
  ConsoleLogger,
  jsonFormat,
  compactFormat,
  prettyFormat,
} from "@zap-studio/logger";

new ConsoleLogger({ format: jsonFormat });
// {"port":3000,"time":1704067200000,"level":"info","msg":"server started"}

new ConsoleLogger({ format: compactFormat });
// port=3000 time=2024-01-01T00:00:00.000Z level=info msg="server started"

new ConsoleLogger({ format: prettyFormat });
// 12:34:56.789 INFO  server started   (colored, context inspected as a second arg)
```

`jsonFormat` and `compactFormat` flatten `context` fields to the top level (a field named `time`, `level`, or `msg` can't override the base field), and safely serialize `Error` and `bigint` context values instead of losing them to `JSON.stringify`'s default behavior.

`prettyFormat`'s color output adapts automatically per runtime, with no configuration — see [Runtime Compatibility](#runtime-compatibility).

Any function matching `LogFormatter` works — no registration required:

```ts
import type { LogFormatter } from "@zap-studio/logger";

const upperFormat: LogFormatter = (record) => [record.message.toUpperCase()];
```

## Custom Implementations

Implement the `Logger` interface directly to plug in any logging backend:

```ts
import type { Logger } from "@zap-studio/logger";

const logger: Logger = {
  trace: (message, context) => myBackend.log("trace", message, context),
  debug: (message, context) => myBackend.log("debug", message, context),
  info: (message, context) => myBackend.log("info", message, context),
  warn: (message, context) => myBackend.log("warn", message, context),
  error: (message, context) => myBackend.log("error", message, context),
  fatal: (message, context) => myBackend.log("fatal", message, context),
};
```

## Runtime Compatibility

Works out of the box on Node.js, Bun, Deno, browsers, and Cloudflare Workers — no configuration needed. `console` dispatch, level filtering, `classicFormat`, `jsonFormat`, and `compactFormat` have no runtime-specific code at all. The only per-runtime behavior is `prettyFormat`'s color detection:

| Runtime | Colored? |
| --- | --- |
| Node / Bun / Deno | On a real TTY only, never when `NO_COLOR` is set |
| Browsers | Always — devtools render ANSI fine |
| Cloudflare Workers | Never — output may land in the dashboard's web log viewer, which can't render it |

## Runtime Support

| Runtime            | Minimum version                         |
| ------------------ | --------------------------------------- |
| Node.js            | 18.0.0                                  |
| Bun                | 1.0.0                                   |
| Deno               | 1.42                                    |
| Cloudflare Workers | Any current release                     |
| Browsers           | Chrome/Edge 98, Firefox 97, Safari 15.4 |

Deno 1.42 is the first release that can install packages from JSR (`deno add jsr:@zap-studio/logger`).

## License

MIT
