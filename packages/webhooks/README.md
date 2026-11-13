# @zap-studio/webhooks

Schema-first, type-safe webhook routing built on the standard Web API [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) and [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) primitives, with runtime-agnostic signature verification support.

Full documentation: [docs/webhooks](https://github.com/zap-studio/monorepo/tree/main/docs/webhooks)

## Installation

```bash
npm install @zap-studio/webhooks
```

You also need a schema library that implements [Standard Schema](https://github.com/standard-schema/standard-schema), such as Zod, Valibot, or ArkType.

## Quick Start

```ts
import { ConsoleLogger } from "@zap-studio/logger";
import { createWebhookRouter } from "@zap-studio/webhooks";
import { z } from "zod";

const logger = new ConsoleLogger({ minLevel: "debug" });
const router = createWebhookRouter({ prefix: "/webhooks", logger });

router.register("/payments/succeeded", {
  schema: z.object({ id: z.string(), amount: z.number().positive() }),
  handler: ({ payload }) => {
    // payload is inferred from schema
    return Response.json({ processed: payload.id });
  },
});

export default {
  fetch: (request: Request) => router.handle(request),
};
```

## Runtime Support

| Runtime            | Minimum version                                  |
| ------------------ | ------------------------------------------------ |
| Node.js            | 18.0.0 (router), 19.0.0 (verification helper)    |
| Bun                | 1.0.0                                            |
| Deno               | 1.42                                             |
| Cloudflare Workers | Any current release                              |
| Browsers           | Latest evergreen (Chrome, Edge, Firefox, Safari) |

The router only needs the standard `Request`/`Response` APIs, available globally since Node.js 18. The verification helper additionally needs `globalThis.crypto.subtle`, which is global by default from Node.js 19 (on Node.js 18, pass the `--experimental-global-webcrypto` flag). In browsers, Web Crypto requires a secure context (HTTPS). Deno 1.42 is the first release that can install packages from JSR (`deno add jsr:@zap-studio/webhooks`).

## License

MIT
