# @zap-studio/webhooks

Schema-first, type-safe webhook routing built on the standard Web API [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) and [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) primitives, with runtime-agnostic signature verification support.

Works with any validation library that implements [Standard Schema](https://github.com/standard-schema/standard-schema), including Zod, Valibot, and ArkType.

## Why this package exists

Webhook handlers usually repeat the same plumbing:

- verify request authenticity
- parse and validate payloads
- route by event path
- normalize success/error responses

`@zap-studio/webhooks` isolates that plumbing so your handler code stays focused on business logic.

Schemas are the source of truth, and payload types are inferred from them.

## Quickstart

```ts
import { createWebhookRouter } from "@zap-studio/webhooks";
import { z } from "zod";

const router = createWebhookRouter({
  prefix: "/webhooks", // default
});

router.register("/payments/succeeded", {
  schema: z.object({
    id: z.string(),
    amount: z.number().positive(),
    currency: z.string().length(3),
  }),
  handler: ({ payload }) => {
    // payload is inferred from schema
    return Response.json(`processed ${payload.id}`);
  },
});

// Any fetch-compatible runtime: Bun, Deno, Cloudflare Workers, ...
export default {
  fetch: (request: Request) => router.handle(request),
};
```

`router.handle` takes a standard `Request` and returns a standard `Response`, so the router plugs directly into any fetch-native runtime — no adapter layer needed.

Handlers can return a `Response`, or `undefined` to let the router reply with its default `200` acknowledgement.

### Paths and the prefix

Routes are registered with a leading slash (`"/payments/succeeded"`) and matched relative to the router's `prefix` (default `"/webhooks"`, no trailing slash) — so the example above answers on `/webhooks/payments/succeeded`. Paths are normalized internally: missing leading slashes are added, trailing slashes stripped, and duplicate slashes collapsed, on both registered routes and incoming request URLs. Set `prefix: ""` (or `"/"`) to mount routes at the root.

## Runtime integration

Because `handle(request)` speaks fetch, integration is one line in most environments:

```ts
// Bun / Deno / Cloudflare Workers
export default { fetch: (request: Request) => router.handle(request) };

// Next.js route handler (app/webhooks/[...path]/route.ts)
export const POST = (request: Request) => router.handle(request);

// Hono
app.all("/webhooks/*", (c) => router.handle(c.req.raw));
```

For raw Node `http` servers, use a fetch-to-Node bridge such as [`srvx`](https://srvx.h3.dev) or [`@hono/node-server`](https://github.com/honojs/node-server).

## The webhook context

Hooks, verifiers, and handlers all receive a context object instead of the raw request stream. The router reads the request body exactly once, so the exact bytes stay available for signature verification:

```ts
interface WebhookContext {
  request: Request; // headers, method, url — body already consumed
  rawBody: Uint8Array; // exact request body bytes
  path: string; // matched route key, e.g. "/payments/succeeded"
}
```

Handlers additionally receive `payload`, the schema-validated body.

## GitHub webhook example

```ts
import { createHmacVerifier, createWebhookRouter } from "@zap-studio/webhooks";
import { z } from "zod";

const router = createWebhookRouter({
  verify: createHmacVerifier({
    headerName: "x-hub-signature-256",
    secret: process.env.GITHUB_WEBHOOK_SECRET!,
  }),
});

router.register("/github/push", {
  schema: z.object({
    ref: z.string(),
    repository: z.object({
      full_name: z.string(),
    }),
  }),
  handler: ({ payload }) => {
    console.log(`[github] ${payload.repository.full_name} ${payload.ref}`);
    return undefined; // default 200 "ok"
  },
});
```

## Stripe webhook example

```ts
import Stripe from "stripe";
import { createWebhookRouter } from "@zap-studio/webhooks";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const router = createWebhookRouter({
  verify: ({ request, rawBody }) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("Missing Stripe signature");
    }

    stripe.webhooks.constructEvent(
      Buffer.from(rawBody),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  },
});

router.register("/stripe/payment_intent.succeeded", {
  schema: z.object({
    id: z.string(),
    object: z.literal("event"),
    type: z.literal("payment_intent.succeeded"),
  }),
  handler: ({ payload }) => {
    console.log(`[stripe] event ${payload.id} (${payload.type})`);
    return Response.json("received");
  },
});
```

## Lifecycle hooks

Lifecycle hooks let you apply cross-cutting behavior without duplicating code in each handler:

- `before`: run logic before verify/validation/handler (logging, tracing, rate-limit checks)
- `after`: run logic after successful handler execution (metrics, audit logs)
- `onError`: map thrown errors to consistent responses and centralize error reporting

```ts
const router = createWebhookRouter({
  before: (ctx) => {
    console.log("incoming", ctx.path);
  },
  after: (_ctx, response) => {
    console.log("status", response.status);
  },
  onError: (error) => Response.json({ error: error.message }, { status: 500 }),
});
```

After-hooks receive the outgoing `Response` as-is. If a hook needs to read the body, call `response.clone()` first so the stream sent to the client stays readable:

```ts
const router = createWebhookRouter({
  after: async (_ctx, response) => {
    const body = await response.clone().json();
    console.log("responded with", body);
  },
});
```

## Verification helper

`@zap-studio/webhooks` exports `createHmacVerifier`, a small helper that builds a `verify` function for HMAC-signed webhook providers.

It does not depend on Node APIs. The verifier uses the Web Crypto API, so it works in any runtime that provides `globalThis.crypto.subtle`.

- reads a signature from the header you choose
- computes an HMAC from `ctx.rawBody`
- compares signatures in constant time
- uses the Web Crypto API instead of Node `crypto`
- works across runtimes that provide `globalThis.crypto.subtle`
- expects a string secret
- throws `VerificationError` on verifier setup or signature failures

```ts
import { createHmacVerifier, VerificationError } from "@zap-studio/webhooks";

const verify = createHmacVerifier({
  headerName: "x-hub-signature-256",
  secret: process.env.WEBHOOK_SECRET!,
  algo: "sha256", // optional, defaults to sha256
});

try {
  await verify(ctx);
} catch (error) {
  if (error instanceof VerificationError) {
    console.error("webhook verification failed", error.message);
  }
}
```

Use this when your provider uses standard HMAC signatures. For providers with custom signing formats, pass your own `verify` function.

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
