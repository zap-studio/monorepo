# @zap-studio/retry

Composable retry policy primitives for HTTP clients and async workflows.

Full documentation: [docs/retry](https://github.com/zap-studio/monorepo/tree/main/docs/retry)

## Installation

```bash
npm install @zap-studio/retry
```

## Quick Start

```ts
import { $fetch } from "@zap-studio/fetch";
import { ConsoleLogger } from "@zap-studio/logger";
import { exponentialBackoff, runRetryPolicy } from "@zap-studio/retry";

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

## License

MIT
