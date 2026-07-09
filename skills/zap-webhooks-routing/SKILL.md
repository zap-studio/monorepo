---
name: zap-webhooks-routing
description: Use @zap-studio/webhooks in an application or framework adapter. Use when creating webhook routers with createWebhookRouter, registering schema-validated handlers, handling NormalizedRequest/NormalizedResponse, adding before/after/onError hooks, writing verify functions, using HMAC signature verification, or implementing BaseAdapter adapters.
---

# Zap Webhooks Routing

Use this skill when consuming `@zap-studio/webhooks`.

## Router Workflow

1. Create a router with optional `prefix`, global `before`, `after`, `onError`, and `verify`.
2. Register route paths without the prefix.
3. Provide a Standard Schema when the handler should receive typed payloads.
4. Call `handle(req)` with a `NormalizedRequest`.
5. Return `NormalizedResponse` from handlers or use `ack()`.

```ts
import { createWebhookRouter } from "@zap-studio/webhooks";
import { z } from "zod";

const router = createWebhookRouter({ prefix: "/webhooks/" });

router.register("payments/succeeded", {
  schema: z.object({ id: z.string(), amount: z.number().positive() }),
  handler: async ({ payload, ack }) => {
    return ack({ status: 200, body: { processed: payload.id } });
  },
});
```

## Verification

Use `createHmacVerifier` for standard HMAC signatures.

```ts
import { createHmacVerifier } from "@zap-studio/webhooks/verify";

const router = createWebhookRouter({
  verify: createHmacVerifier({
    headerName: "x-hub-signature-256",
    secret: process.env.WEBHOOK_SECRET!,
  }),
});
```

For providers with custom signing formats, pass a custom `verify(req)` function. Throw to reject; `handle` converts thrown errors through `onError` or the default `500` response.

## Adapter Rules

Adapters must preserve the raw body bytes for signature verification.

```ts
import { BaseAdapter } from "@zap-studio/webhooks/adapters/base";
import type { NormalizedRequest } from "@zap-studio/webhooks/types";

class MyAdapter extends BaseAdapter<Request, Response> {
  async toNormalizedRequest(req: Request): Promise<NormalizedRequest> {
    return {
      method: req.method,
      path: new URL(req.url).pathname,
      headers: req.headers,
      rawBody: new Uint8Array(await req.arrayBuffer()),
    };
  }
}
```

## Gotchas

- Paths must start with the router prefix or `handle` returns `404`.
- `register("github/push", ...)` matches `/webhooks/github/push` when prefix is `/webhooks/`.
- Invalid JSON becomes `undefined`; schema validation then returns a `400` response.
- Schema validation uses non-throw mode and maps issues into `{ status: 400, body }`.
- Hook order is global before, route before, verify, parse/validate, handler, route after, global after.
- Preserve `rawBody` exactly; do not reserialize JSON before verifying signatures.

## References

- Package docs: https://zapstudio.dev/packages/webhooks
- llms.txt: https://zapstudio.dev/llms.txt
- llms-full.txt: https://zapstudio.dev/llms-full.txt
