# @zap-studio/webhooks

A lightweight, type-safe webhook router with schema-agnostic validation support. Works with any validation library including Zod, Yup, Valibot, ArkType, and custom validators.

## Features

- 🎯 **Type-safe routing** - Full TypeScript support with path-to-payload type mapping
- ✅ **Schema-agnostic validation** - Works with any validation library
- 🔒 **Request verification** - Built-in support for signature verification
- 🚀 **Zero dependencies** (validation libraries are optional peer dependencies)
- 📦 **Tiny bundle size** - Only includes what you need
- 🔌 **Adapter pattern** - Easy integration with existing validation libraries

## Installation

```bash
npm install @zap-studio/webhooks
# or
pnpm add @zap-studio/webhooks
```

If you want to use schema validation, install your preferred validation library:

```bash
# Zod (recommended)
pnpm add zod

# Or Yup
pnpm add yup

# Or Valibot
pnpm add valibot

# Or ArkType
pnpm add arktype
```

## Quick Start

### Basic Usage (No Validation)

```typescript
import { WebhookRouter } from "@zap-studio/webhooks";

interface WebhookMap {
  "payment": { id: string; amount: number };
  "subscription": { id: string; status: "active" | "canceled" };
}

const router = new WebhookRouter<WebhookMap>();

router.register("/payment", async ({ payload, ack }) => {
  console.log(`Payment received: $${payload.amount}`);
  return ack({ status: 200, body: "Payment processed" });
});

// Handle incoming request
const response = await router.handle(incomingRequest);
```

### With Zod Validation

```typescript
import { WebhookRouter } from "@zap-studio/webhooks";
import { zodValidator } from "@zap-studio/webhooks/adapters/validators";
import { z } from "zod";

interface WebhookMap {
  "payment": { id: string; amount: number; currency: string };
}

const router = new WebhookRouter<WebhookMap>();

const paymentSchema = z.object({
  id: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3),
});

router.register("/payment", {
  schema: zodValidator(paymentSchema),
  handler: async ({ payload, ack }) => {
    // payload is validated and fully typed!
    console.log(`Payment ${payload.id}: ${payload.amount} ${payload.currency}`);
    return ack({ status: 200 });
  },
});
```

### With Request Verification

```typescript
import { WebhookRouter } from "@zap-studio/webhooks";

// Custom verify function
const router = new WebhookRouter({
  verify: async (req) => {
    const signature = req.headers.get("x-webhook-signature");
    if (!signature) {
      throw new Error("Missing signature");
    }
    
    // Example: HMAC signature verification
    const crypto = await import("node:crypto");
    const expectedSignature = crypto
      .createHmac("sha256", process.env.WEBHOOK_SECRET!)
      .update(req.rawBody)
      .digest("hex");
    
    if (signature !== expectedSignature) {
      throw new Error("Invalid signature");
    }
  },
});
```

## Schema Validation Libraries

### Zod (Recommended)

```typescript
import { zodValidator } from "@zap-studio/webhooks/adapters/validators";
import { z } from "zod";

const schema = z.object({
  id: z.string(),
  amount: z.number().positive(),
  items: z.array(z.object({
    sku: z.string(),
    quantity: z.number().int().positive(),
  })),
});

router.register("/order", {
  schema: zodValidator(schema),
  handler: async ({ payload, ack }) => {
    // Fully validated and typed
    return ack({ status: 200 });
  },
});
```

### Yup

```typescript
import { yupValidator } from "@zap-studio/webhooks/adapters/validators";
import * as yup from "yup";

const schema = yup.object({
  id: yup.string().required(),
  amount: yup.number().positive().required(),
});

router.register("/payment", {
  schema: yupValidator(schema),
  handler: async ({ payload, ack }) => {
    return ack({ status: 200 });
  },
});
```

### Valibot

```typescript
import { valibotValidator } from "@zap-studio/webhooks/adapters/validators";
import * as v from "valibot";

const schema = v.object({
  id: v.string(),
  amount: v.pipe(v.number(), v.minValue(0)),
});

router.register("/payment", {
  schema: valibotValidator(schema),
  handler: async ({ payload, ack }) => {
    return ack({ status: 200 });
  },
});
```

### ArkType

```typescript
import { arktypeValidator } from "@zap-studio/webhooks/adapters/validators";
import { type } from "arktype";

const schema = type({
  id: "string",
  amount: "number>0",
});

router.register("/payment", {
  schema: arktypeValidator(schema),
  handler: async ({ payload, ack }) => {
    return ack({ status: 200 });
  },
});
```

### Custom Validator

You can create your own validator by implementing the `SchemaValidator` interface:

```typescript
import type { SchemaValidator } from "@zap-studio/webhooks";

const customValidator: SchemaValidator<{ id: string; value: number }> = {
  validate: (data: unknown) => {
    const obj = data as any;
    
    // Your validation logic
    if (!obj.id || typeof obj.id !== "string") {
      return {
        success: false,
        errors: [{ path: ["id"], message: "ID is required and must be a string" }],
      };
    }
    
    if (!obj.value || typeof obj.value !== "number" || obj.value < 0) {
      return {
        success: false,
        errors: [{ path: ["value"], message: "Value must be a positive number" }],
      };
    }
    
    return {
      success: true,
      data: { id: obj.id, value: obj.value },
    };
  },
};

router.register("/custom", {
  schema: customValidator,
  handler: async ({ payload, ack }) => {
    return ack({ status: 200 });
  },
});
```

## API Reference

### `WebhookRouter<TMap>`

Creates a new webhook router.

```typescript
const router = new WebhookRouter<WebhookMap>(options?);
```

**Options:**
- `verify?: (req: NormalizedRequest) => Promise<void> | void` - Optional function to verify incoming requests (e.g., signature verification)

### `router.register(path, handler)`

Register a webhook handler without validation.

```typescript
router.register("/webhook", async ({ req, payload, ack }) => {
  return ack({ status: 200, body: "Success" });
});
```

### `router.register(path, options)`

Register a webhook handler with schema validation.

```typescript
router.register("/webhook", {
  schema: zodValidator(mySchema),
  handler: async ({ req, payload, ack }) => {
    return ack({ status: 200 });
  },
});
```

### `router.handle(request)`

Handle an incoming webhook request.

```typescript
const response = await router.handle(normalizedRequest);
```

## Type Reference

### `NormalizedRequest`

```typescript
interface NormalizedRequest {
  method: HTTPMethod;
  path: string;
  headers: Headers;
  rawBody: Buffer;
  json?: unknown;
  text?: string;
  query?: Record<string, string | string[]>;
  params?: Record<string, string>;
}
```

### `NormalizedResponse`

```typescript
interface NormalizedResponse {
  status: number;
  body?: unknown;
  headers?: Headers;
}
```

### `SchemaValidator<T>`

```typescript
interface SchemaValidator<T> {
  validate(data: unknown): ValidationResult<T> | Promise<ValidationResult<T>>;
}

interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Array<{
    path?: string[];
    message: string;
  }>;
}
```

## Framework Integration

### Next.js API Route

```typescript
import { WebhookRouter } from "@zap-studio/webhooks";
import type { NextApiRequest, NextApiResponse } from "next";

const router = new WebhookRouter<WebhookMap>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const normalizedRequest = {
    method: req.method as any,
    path: req.url || "/",
    headers: new Headers(req.headers as any),
    rawBody: Buffer.from(JSON.stringify(req.body)),
  };

  const response = await router.handle(normalizedRequest);
  res.status(response.status).json(response.body);
}
```

### Express

```typescript
import express from "express";
import { WebhookRouter } from "@zap-studio/webhooks";

const app = express();
const router = new WebhookRouter<WebhookMap>();

app.post("/webhook/*", express.raw({ type: "application/json" }), async (req, res) => {
  const normalizedRequest = {
    method: "POST",
    path: req.path,
    headers: new Headers(req.headers as any),
    rawBody: req.body,
  };

  const response = await router.handle(normalizedRequest);
  res.status(response.status).json(response.body);
});
```

## License

MIT
