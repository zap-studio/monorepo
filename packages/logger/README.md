# @zap-studio/logger

A lean logging abstraction: one `Logger` interface, one `ConsoleLogger` implementation.

Full documentation: [docs/logger](https://github.com/zap-studio/monorepo/tree/main/docs/logger)

## Installation

```bash
npm install @zap-studio/logger
```

## Quick Start

```ts
import { ConsoleLogger } from "@zap-studio/logger";

const logger = new ConsoleLogger({ minLevel: "debug" });

logger.debug("cache miss", { key: "user:42" });
logger.warn("retrying after failure", { attempt: 2 });
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
