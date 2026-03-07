---
name: zap-webhooks-routing-and-verification
description: >
  Build webhook ingestion with @zap-studio/webhooks using createWebhookRouter,
  register path keys, prefix normalization, schema validation, lifecycle hooks,
  createHmacVerifier, and BaseAdapter request/response mapping.
type: core
library: '@zap-studio/webhooks'
library_version: '0.1.3'
sources:
  - 'zap-studio/monorepo:packages/webhooks/README.md'
  - 'zap-studio/monorepo:packages/webhooks/src/index.ts'
  - 'zap-studio/monorepo:packages/webhooks/src/verify.ts'
  - 'zap-studio/monorepo:packages/webhooks/src/adapters/base.ts'
---

# @zap-studio/webhooks — Routing and Verification

## Setup

```ts
import { createWebhookRouter } from '@zap-studio/webhooks';
import { createHmacVerifier } from '@zap-studio/webhooks/verify';
import { z } from 'zod';

const router = createWebhookRouter({
  prefix: '/webhooks/',
  verify: createHmacVerifier({
    headerName: 'x-hub-signature-256',
    secret: process.env.WEBHOOK_SECRET!,
  }),
});

router.register('github/push', {
  schema: z.object({ ref: z.string() }),
  handler: async ({ payload, ack }) => {
    console.log(payload.ref);
    return ack({ status: 200, body: 'ok' });
  },
});
```

## Core Patterns

### Add global hooks for observability and error shaping

```ts
const router = createWebhookRouter({
  before: (req) => {
    console.log('incoming', req.path);
  },
  after: (_req, res) => {
    console.log('status', res.status);
  },
  onError: (error) => ({
    status: 500,
    body: { error: error.message },
  }),
});
```

### Register route-specific hooks

```ts
router.register('payments/succeeded', {
  schema: PaymentSchema,
  before: (req) => {
    req.headers.set('x-processed', '1');
  },
  after: (_req, res) => {
    console.log('finished', res.status);
  },
  handler: async ({ payload, ack }) => ack({ body: { id: payload.id } }),
});
```

### Implement an adapter with `BaseAdapter`

```ts
import { BaseAdapter } from '@zap-studio/webhooks/adapters/base';

class MyAdapter extends BaseAdapter {
  async toNormalizedRequest(req: Request) {
    return {
      method: req.method,
      path: req.url,
      headers: req.headers,
      rawBody: Buffer.from(await req.text()),
    };
  }

  async toFrameworkResponse(res: Response, normalized) {
    return new Response(JSON.stringify(normalized.body), {
      status: normalized.status,
      headers: normalized.headers,
    }) as unknown as Response;
  }
}
```

## Common Mistakes

### HIGH Registering paths with leading slash

Wrong:

```ts
router.register('/github/push', {
  schema: PushSchema,
  handler,
});
```

Correct:

```ts
router.register('github/push', {
  schema: PushSchema,
  handler,
});
```

Incoming paths normalize to slashless keys; leading slash route keys do not match and return 404.

Source: zap-studio/monorepo:packages/webhooks/src/index.ts

### CRITICAL Verifying a transformed payload instead of raw body

Wrong:

```ts
const parsed = JSON.parse(req.rawBody.toString());
await verifyProvider(JSON.stringify(parsed));
```

Correct:

```ts
await verify(req); // uses req.rawBody bytes
const parsed = JSON.parse(req.rawBody.toString());
```

Signature checks must run on exact raw bytes; any parse/serialize transformation can invalidate signatures.

Source: zap-studio/monorepo:packages/webhooks/src/verify.ts

### HIGH Using Node HMAC verifier in non-Node runtime

Wrong:

```ts
const verify = createHmacVerifier({
  headerName: 'x-signature',
  secret: env.WEBHOOK_SECRET,
});
// used in edge runtime
```

Correct:

```ts
const verify = async (req) => {
  // implement provider verification with Web Crypto in edge runtimes
};
```

`createHmacVerifier` imports `node:crypto` and is intended for Node-compatible runtimes.

Source: zap-studio/monorepo:packages/webhooks/src/verify.ts

See also: zap-validation-standard-schema/SKILL.md — payload validation result handling.
