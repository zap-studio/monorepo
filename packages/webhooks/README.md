# @zap-studio/webhooks

A lightweight, type-safe webhook router with schema-agnostic validation support. Works with any validation library including Zod, Yup, Valibot, ArkType, and custom validators.

## Features

- 🎯 **Type-safe routing** - Full TypeScript support with path-to-payload type mapping
- ✅ **Schema-agnostic validation** - Works with any validation library
- 🔒 **Request verification** - Built-in support for signature verification
- 🪝 **Lifecycle hooks** - Before, after, and error hooks for fine-grained control
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

type WebhookMap = {
  "payment": { id: string; amount: number };
  "subscription": { id: string; status: "active" | "canceled" };
}

const router = new WebhookRouter<WebhookMap>();

router.register("payment", async ({ payload, ack }) => {
  console.log(`Payment received: $${payload.amount}`);
  return ack({ status: 200, body: "Payment processed" });
});

// Handle incoming request
const response = await router.handle(incomingRequest);
```

### With Zod Validation

```typescript
import { WebhookRouter } from "@zap-studio/webhooks";
import { zodValidator } from "@zap-studio/webhooks/validators";
import { z } from "zod";

type WebhookMap = {
  "payment": { id: string; amount: number; currency: string };
}

const router = new WebhookRouter<WebhookMap>();

const paymentSchema = z.object({
  id: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3),
});

router.register("payment", {
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

## Lifecycle Hooks

The webhook router supports three types of lifecycle hooks: `before`, `after`, and `onError`. These hooks provide fine-grained control over request processing and allow you to add cross-cutting concerns like logging, monitoring, and error handling.

### Hook Execution Order

```
before (global) → before (route) → verify → validate → handler → after (route) → after (global)
```

### Global Hooks

Global hooks are defined in the router constructor and apply to all routes.

```typescript
import { WebhookRouter } from "@zap-studio/webhooks";

const router = new WebhookRouter({
  // Runs before verification and validation
  before: [
    async (req) => {
      console.log(`[${new Date().toISOString()}] Incoming: ${req.path}`);
      // Enrich request with metadata
      req.metadata = { receivedAt: Date.now() };
    },
    async (req) => {
      // Rate limiting check
      const clientIp = req.headers.get("x-forwarded-for");
      if (await isRateLimited(clientIp)) {
        throw new Error("Rate limit exceeded");
      }
    }
  ],
  
  // Runs after successful handler completion
  after: [
    async (req, res) => {
      const duration = Date.now() - (req.metadata?.receivedAt || 0);
      console.log(`[${new Date().toISOString()}] Completed ${req.path} (${duration}ms)`);
      
      // Send metrics
      await metrics.record({
        path: req.path,
        status: res.status,
        duration
      });
    }
  ],
  
  // Runs when any error occurs
  onError: async (error, req) => {
    console.error(`Error handling ${req.path}:`, error);
    
    // Send to error tracking service
    await errorTracker.capture(error, { 
      path: req.path,
      headers: Object.fromEntries(req.headers.entries())
    });
    
    // Return custom error response
    if (error.message === "Rate limit exceeded") {
      return { status: 429, body: { error: "Too many requests" } };
    }
    
    if (error.message === "Invalid signature") {
      return { status: 401, body: { error: "Unauthorized" } };
    }
    
    // Return undefined to use default error response
    return { status: 500, body: { error: "Internal server error" } };
  },
  
  verify: async (req) => {
    // Signature verification
    await verifySignature(req);
  }
});
```

### Route-Level Hooks

Route-level hooks are specific to individual routes and execute after global `before` hooks but before global `after` hooks.

```typescript
router.register("payment", {
  schema: zodValidator(paymentSchema),
  
  // Route-specific before hooks (run after global before hooks)
  before: [
    async (req) => {
      // Payment-specific validation
      const apiKey = req.headers.get("x-api-key");
      if (!await isValidPaymentApiKey(apiKey)) {
        throw new Error("Invalid API key for payment webhook");
      }
    }
  ],
  
  handler: async ({ payload, ack }) => {
    await processPayment(payload);
    return ack({ status: 200, body: { received: true } });
  },
  
  // Route-specific after hooks (run before global after hooks)
  after: [
    async (req, res) => {
      // Payment-specific audit logging
      await auditLog.record({
        type: "payment_webhook",
        paymentId: req.json?.id,
        status: res.status,
        timestamp: new Date().toISOString()
      });
    }
  ]
});
```

### Practical Examples

#### Example 1: Request Logging & Monitoring

```typescript
const router = new WebhookRouter({
  before: [
    async (req) => {
      // Add request ID for tracing
      if (!req.headers.get("x-request-id")) {
        req.headers.set("x-request-id", crypto.randomUUID());
      }
      
      // Log incoming request
      logger.info("webhook.received", {
        requestId: req.headers.get("x-request-id"),
        path: req.path,
        method: req.method
      });
    }
  ],
  
  after: [
    async (req, res) => {
      // Log response
      logger.info("webhook.completed", {
        requestId: req.headers.get("x-request-id"),
        path: req.path,
        status: res.status
      });
    }
  ],
  
  onError: async (error, req) => {
    logger.error("webhook.error", {
      requestId: req.headers.get("x-request-id"),
      path: req.path,
      error: error.message,
      stack: error.stack
    });
    
    return { status: 500, body: { error: "Internal error" } };
  }
});
```

#### Example 2: Authentication & Authorization

```typescript
const router = new WebhookRouter({
  before: [
    async (req) => {
      // Parse JWT from Authorization header
      const token = req.headers.get("authorization")?.replace("Bearer ", "");
      if (token) {
        try {
          req.user = await verifyJWT(token);
        } catch (error) {
          throw new Error("Invalid token");
        }
      }
    },
    async (req) => {
      // Check admin routes require admin users
      if (req.path.startsWith("/admin")) {
        if (!req.user?.isAdmin) {
          throw new Error("Unauthorized: Admin access required");
        }
      }
    }
  ],
  
  onError: async (error, req) => {
    if (error.message.startsWith("Unauthorized")) {
      return { status: 403, body: { error: "Forbidden" } };
    }
    if (error.message === "Invalid token") {
      return { status: 401, body: { error: "Unauthorized" } };
    }
  }
});
```

#### Example 3: Stripe Webhooks with Complete Monitoring

```typescript
import { WebhookRouter } from "@zap-studio/webhooks";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const router = new WebhookRouter<{
  "stripe": Stripe.Event
}>({
  before: [
    async (req) => {
      // Track webhook reception time
      req.metadata = { startTime: Date.now() };
      
      console.log(`Stripe webhook received: ${req.headers.get("stripe-signature")?.slice(0, 20)}...`);
    }
  ],
  
  verify: async (req) => {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature");
    }
    
    try {
      // Verify Stripe signature
      stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      throw new Error("Invalid Stripe signature");
    }
  },
  
  after: [
    async (req, res) => {
      const duration = Date.now() - req.metadata.startTime;
      
      // Record metrics
      await metrics.increment("stripe.webhook.processed", {
        event_type: req.json?.type,
        status: res.status.toString()
      });
      
      await metrics.timing("stripe.webhook.duration", duration, {
        event_type: req.json?.type
      });
    }
  ],
  
  onError: async (error, req) => {
    const eventType = req.json?.type || "unknown";
    
    // Alert for critical payment webhooks
    if (eventType.includes("payment") || eventType.includes("charge")) {
      await alerting.send({
        severity: "high",
        title: "Stripe Payment Webhook Failed",
        message: `Failed to process ${eventType}: ${error.message}`,
        metadata: {
          path: req.path,
          eventType,
          error: error.message
        }
      });
    }
    
    // Log to error tracking
    await errorTracker.capture(error, {
      fingerprint: ["stripe-webhook", eventType],
      tags: { event_type: eventType }
    });
    
    return { status: 500, body: { error: error.message } };
  }
});

router.register("stripe", async ({ payload, ack }) => {
  // Process Stripe event
  switch (payload.type) {
    case "payment_intent.succeeded":
      await handlePaymentSuccess(payload.data.object);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentFailure(payload.data.object);
      break;
    case "customer.subscription.created":
      await handleSubscriptionCreated(payload.data.object);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionCanceled(payload.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${payload.type}`);
  }
  
  return ack({ status: 200 });
});
```

#### Example 4: Database Connection Management

```typescript
const router = new WebhookRouter({
  before: [
    async (req) => {
      // Attach database connection to request
      req.db = await database.getConnection();
    }
  ],
  
  after: [
    async (req) => {
      // Clean up database connection
      if (req.db) {
        await req.db.close();
      }
    }
  ],
  
  onError: async (error, req) => {
    // Ensure database connection is closed on error
    if (req.db) {
      await req.db.close();
    }
    
    return { status: 500, body: { error: "Internal error" } };
  }
});
```

### Hook Best Practices

1. **Keep hooks focused** - Each hook should have a single responsibility
2. **Handle errors appropriately** - Throw errors in `before` hooks to prevent handler execution
3. **Use route-level hooks for route-specific logic** - Keep global hooks for cross-cutting concerns
4. **Avoid modifying responses in after hooks** - They're meant for side effects, not response modification
5. **Always clean up resources** - Use `after` and `onError` hooks to clean up connections, files, etc.
6. **Log strategically** - Use hooks for consistent logging across all webhooks
7. **Return custom error responses** - Use `onError` to provide meaningful error messages to clients

## Schema Validation Libraries

### Zod (Recommended)

```typescript
import { zodValidator } from "@zap-studio/webhooks/validators";
import { z } from "zod";

const schema = z.object({
  id: z.string(),
  amount: z.number().positive(),
  items: z.array(z.object({
    sku: z.string(),
    quantity: z.number().int().positive(),
  })),
});

router.register("order", {
  schema: zodValidator(schema),
  handler: async ({ payload, ack }) => {
    // Fully validated and typed
    return ack({ status: 200 });
  },
});
```

### Yup

```typescript
import { yupValidator } from "@zap-studio/webhooks/validators";
import * as yup from "yup";

const schema = yup.object({
  id: yup.string().required(),
  amount: yup.number().positive().required(),
});

router.register("payment", {
  schema: yupValidator(schema),
  handler: async ({ payload, ack }) => {
    return ack({ status: 200 });
  },
});
```

### Valibot

```typescript
import { valibotValidator } from "@zap-studio/webhooks/validators";
import * as v from "valibot";

const schema = v.object({
  id: v.string(),
  amount: v.pipe(v.number(), v.minValue(0)),
});

router.register("payment", {
  schema: valibotValidator(schema),
  handler: async ({ payload, ack }) => {
    return ack({ status: 200 });
  },
});
```

### ArkType

```typescript
import { arktypeValidator } from "@zap-studio/webhooks/validators";
import { type } from "arktype";

const schema = type({
  id: "string",
  amount: "number>0",
});

router.register("payment", {
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

router.register("custom", {
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
- `before?: BeforeHook | BeforeHook[]` - Hook(s) that run before request processing
- `after?: AfterHook | AfterHook[]` - Hook(s) that run after successful request processing
- `onError?: ErrorHook` - Hook that runs when an error occurs

### `router.register(path, handler)`

Register a webhook handler without validation.

```typescript
router.register("webhook", async ({ req, payload, ack }) => {
  return ack({ status: 200, body: "Success" });
});
```

### `router.register(path, options)`

Register a webhook handler with schema validation and/or route-level hooks.

```typescript
router.register("webhook", {
  schema: zodValidator(mySchema),
  before: [async (req) => { /* ... */ }],
  handler: async ({ req, payload, ack }) => {
    return ack({ status: 200 });
  },
  after: [async (req, res) => { /* ... */ }],
});
```

**Options:**
- `handler: WebhookHandler<T>` - The handler function to process the webhook
- `schema?: SchemaValidator<T>` - Optional schema validator
- `before?: BeforeHook | BeforeHook[]` - Route-specific before hook(s)
- `after?: AfterHook | AfterHook[]` - Route-specific after hook(s)

### `router.handle(request)`

Handle an incoming webhook request.

```typescript
const response = await router.handle(normalizedRequest);
```

## Type Reference

### `NormalizedRequest`

```typescript
type NormalizedRequest = {
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
type NormalizedResponse = {
  status: number;
  body?: unknown;
  headers?: Headers;
}
```

### `SchemaValidator<T>`

```typescript
type SchemaValidator<T> = {
  validate(data: unknown): ValidationResult<T> | Promise<ValidationResult<T>>;
}

type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: Array<{
    path?: string[];
    message: string;
  }>;
}
```

### Hook Types

#### `BeforeHook`

Executes before request processing (including verification and validation). Can modify the request or throw to short-circuit execution.

```typescript
type BeforeHook = (req: NormalizedRequest) => Promise<void> | void;
```

**Use cases:**
- Request logging
- Request enrichment (adding metadata)
- Rate limiting
- Early validation
- Authentication

#### `AfterHook`

Executes after successful handler completion. Receives both request and response. Cannot modify the response.

```typescript
type AfterHook = (
  req: NormalizedRequest,
  res: NormalizedResponse
) => Promise<void> | void;
```

**Use cases:**
- Response logging
- Metrics collection
- Resource cleanup
- Audit logging

#### `ErrorHook`

Executes when any error occurs during request processing. Can return a custom error response or undefined to use the default.

```typescript
type ErrorHook = (
  error: Error,
  req: NormalizedRequest
) => Promise<NormalizedResponse | undefined> | NormalizedResponse | undefined;
```

**Use cases:**
- Error logging
- Error tracking (Sentry, etc.)
- Custom error responses
- Alerting
- Resource cleanup on errors

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
