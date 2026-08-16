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
- **Zero dependencies, tree-shakeable** — unused exports are dropped by any modern bundler.
- **Optional by design** — other `@zap-studio/*` packages accept a `logger?: Logger` option; omit it and there's zero logging overhead.

## Quick Start

```ts
import { ConsoleLogger } from "@zap-studio/logger";

const logger = new ConsoleLogger({ minLevel: "debug" });

logger.debug("cache miss", { key: "user:42" });
logger.warn("retrying after failure", { attempt: 2 });
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
