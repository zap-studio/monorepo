# @zap-studio/webhooks

Schema-first, type-safe webhook routing built on the standard Web API [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) and [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) primitives, with runtime-agnostic signature verification support.

Full documentation: [zapstudio.dev/webhooks](https://www.zapstudio.dev/webhooks)

## Motivation

Webhook endpoints are usually built by hand, per provider, and this tends to repeat the same two mistakes. First, signature checks often use Node's `crypto` module, which does not exist on Cloudflare Workers, Deno, or Bun's edge runtimes — so the same code cannot run everywhere the webhook needs to be received. Second, signatures are often compared with `===`, which leaks timing information and opens a timing-attack risk that most teams do not know they have.

`@zap-studio/webhooks` fixes both. It is built on the standard `Request`/`Response` objects, so the same router works on Bun, Deno, Cloudflare Workers, or any framework that accepts a `Request`. Signature verification uses the Web Crypto API (`globalThis.crypto.subtle`) with a constant-time comparison by default, so the safe way is also the default way. Payloads are validated and typed straight from your Standard Schema — no `any` from `JSON.parse`, no manual casts.

## Installation

```bash
npm install @zap-studio/webhooks
```

You also need a schema library that implements [Standard Schema](https://github.com/standard-schema/standard-schema), such as Zod, Valibot, or ArkType.

## Features

- **Web API native** — `handle(request: Request)` returns a `Response`, so the router plugs directly into Bun, Deno, Cloudflare Workers, Next.js route handlers, Hono, and any other fetch-compatible runtime.
- **Type-safe routing** — handler payload types are inferred from the route schema.
- **Standard Schema validation** — bring Zod, Valibot, ArkType, or any compatible library.
- **Signature verification** — built-in HMAC verifier with constant-time comparison, or plug in your own `verify` function.
- **Lifecycle hooks** — global `before`, `after`, and `onError` hooks for cross-cutting behavior.
- **Runtime-agnostic** — uses the Web Crypto API, not Node-specific APIs.
- **Optional logging** through `createWebhookRouter({ logger })` ([`@zap-studio/logger`](https://www.npmjs.com/package/@zap-studio/logger)) — omit it and there's zero logging overhead.
- **Tree-shakeable** — validation and hook-running internals are standalone functions; unused exports are dropped by any modern bundler.

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

## Web API Native

`handle(request: Request)` returns a `Response`, so the router plugs directly into any fetch-compatible runtime.

```ts
// Bun / Deno / Cloudflare Workers
export default { fetch: (request: Request) => router.handle(request) };

// Next.js route handler (app/webhooks/[...path]/route.ts)
export const POST = (request: Request) => router.handle(request);

// Hono
app.all("/webhooks/*", (c) => router.handle(c.req.raw));
```

## Type-Safe Routing

Handler payload types are inferred from the route schema.

```ts
router.register("/payments/succeeded", {
  schema: z.object({ id: z.string(), amount: z.number() }),
  handler: ({ payload }) => {
    // payload.id: string, payload.amount: number — inferred from schema
    return Response.json({ ok: true });
  },
});
```

## Standard Schema Validation

Bring Zod, Valibot, ArkType, or any compatible library.

```ts
import { z } from "zod";
// or: import * as v from "valibot"; import { type } from "arktype";

router.register("/event", {
  schema: z.object({ id: z.string() }),
  handler: ({ payload }) => Response.json(payload),
});
```

## Signature Verification

Built-in HMAC verifier with constant-time comparison, or plug in your own `verify` function.

```ts
import {
  createHmacVerifier,
  createWebhookRouter,
  VerificationError,
} from "@zap-studio/webhooks";

const router = createWebhookRouter({
  verify: createHmacVerifier({
    headerName: "x-hub-signature-256",
    secret: process.env.WEBHOOK_SECRET!,
  }),
  onError: (error) => {
    if (error instanceof VerificationError) {
      return Response.json({ error: "invalid signature" }, { status: 401 });
    }
  },
});
```

## Lifecycle Hooks

Global `before`, `after`, and `onError` hooks for cross-cutting behavior.

```ts
const router = createWebhookRouter({
  before: (ctx) => console.log("incoming", ctx.path),
  after: (_ctx, response) => console.log("status", response.status),
  onError: (error) => Response.json({ error: error.message }, { status: 500 }),
});
```

## Runtime-Agnostic

Uses the Web Crypto API, not Node-specific APIs.

```ts
// Uses globalThis.crypto.subtle — no Node `crypto` import required
const verify = createHmacVerifier({
  headerName: "x-hub-signature-256",
  secret: process.env.WEBHOOK_SECRET!,
});
```

## Logging

Pass a `logger?: Logger` from [`@zap-studio/logger`](https://www.npmjs.com/package/@zap-studio/logger) to `createWebhookRouter(...)` to observe delivery attempts, dispatch, verification failures, and unmatched routes. Omit it and nothing is logged.

```ts
import { ConsoleLogger } from "@zap-studio/logger";
import { createWebhookRouter } from "@zap-studio/webhooks";

const logger = new ConsoleLogger({ minLevel: "debug" });
const router = createWebhookRouter({ prefix: "/webhooks", logger });
```

Each delivery attempt and handler dispatch logs at `debug`; verification failures and unmatched routes log at `warn`.

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
