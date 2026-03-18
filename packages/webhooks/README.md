# @zap-studio/webhooks

Schema-first, type-safe webhook routing with signature verification support.

Works with any validation library that implements [Standard Schema](https://github.com/standard-schema/standard-schema), including Zod, Valibot, and ArkType.

## Why this package exists

Webhook handlers usually repeat the same plumbing:

- verify request authenticity
- parse and validate payloads
- route by event path
- normalize success/error responses

`@zap-studio/webhooks` isolates that plumbing so your handler code stays focused on business logic.

Schemas are the source of truth, and payload types are inferred from them.

## Install

```bash
pnpm add @zap-studio/webhooks
```

## Quickstart

```ts
import { createWebhookRouter } from "@zap-studio/webhooks";
import { z } from "zod";

const router = createWebhookRouter({
  prefix: "/webhooks/",
});

router.register("payments/succeeded", {
  schema: z.object({
    id: z.string(),
    amount: z.number().positive(),
    currency: z.string().length(3),
  }),
  handler: async ({ payload, ack }) => {
    // payload is inferred from schema
    return ack({ status: 200, body: `processed ${payload.id}` });
  },
});
```

## GitHub webhook example

```ts
import { createWebhookRouter } from "@zap-studio/webhooks";
import { createHmacVerifier } from "@zap-studio/webhooks/verify";
import { z } from "zod";

const router = createWebhookRouter({
  verify: createHmacVerifier({
    headerName: "x-hub-signature-256",
    secret: process.env.GITHUB_WEBHOOK_SECRET!,
  }),
});

router.register("github/push", {
  schema: z.object({
    ref: z.string(),
    repository: z.object({
      full_name: z.string(),
    }),
  }),
  handler: async ({ payload, ack }) => {
    console.log(`[github] ${payload.repository.full_name} ${payload.ref}`);
    return ack();
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
  verify: async (req) => {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("Missing Stripe signature");
    }

    stripe.webhooks.constructEvent(req.rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  },
});

router.register("stripe/payment_intent.succeeded", {
  schema: z.object({
    id: z.string(),
    object: z.literal("event"),
    type: z.literal("payment_intent.succeeded"),
  }),
  handler: async ({ payload, ack }) => {
    console.log(`[stripe] event ${payload.id} (${payload.type})`);
    return ack({ status: 200 });
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
  before: (req) => {
    console.log("incoming", req.path);
  },
  after: (_req, res) => {
    console.log("status", res.status);
  },
  onError: (error) => ({
    status: 500,
    body: { error: error.message },
  }),
});
```

## Verification helper

`@zap-studio/webhooks/verify` exports `createHmacVerifier`, a small helper that builds a `verify` function for HMAC-signed webhook providers.

- reads a signature from the header you choose
- computes an HMAC from `req.rawBody`
- compares signatures in constant time

```ts
import { createHmacVerifier } from "@zap-studio/webhooks/verify";

const verify = createHmacVerifier({
  headerName: "x-hub-signature-256",
  secret: process.env.WEBHOOK_SECRET!,
  algo: "sha256", // optional, defaults to sha256
});
```

Use this when your provider uses standard HMAC signatures. For providers with custom signing formats, pass your own `verify` function.

## Why `BaseAdapter` exists

This package is framework-agnostic by design. It does not include Express/Next/Hono/Elysia adapters.

`BaseAdapter` exists to help consumers implement adapters consistently:

- you only implement `toNormalizedRequest` and `toFrameworkResponse`
- `BaseAdapter` handles the common `handleWebhook()` flow
- teams can reuse one adapter implementation across all webhook routes

```ts
import { BaseAdapter } from "@zap-studio/webhooks/adapters/base";
import type { NormalizedRequest, NormalizedResponse } from "@zap-studio/webhooks/types";

class MyHttpAdapter extends BaseAdapter {
  async toNormalizedRequest(req: any): Promise<NormalizedRequest> {
    return {
      method: req.method,
      path: req.url,
      headers: new Headers(req.headers),
      rawBody: req.rawBody,
    };
  }

  async toFrameworkResponse(res: any, normalized: NormalizedResponse): Promise<any> {
    res.statusCode = normalized.status;
    res.end(
      typeof normalized.body === "string" ? normalized.body : JSON.stringify(normalized.body),
    );
    return res;
  }
}
```

## License

MIT
