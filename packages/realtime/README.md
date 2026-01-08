# @zap-studio/realtime

A type-safe real-time event streaming library with Server-Sent Events (SSE) and WebSocket (WS) support. Built for modern web applications, it provides seamless pub/sub functionality across servers and clients, with built-in schema validation for type safety.

## Features

- 🛡️ **Type-Safe Events**: Define events with schemas (compatible with any [Standard Schema](https://standardschema.dev/) implementation) for automatic validation.
- 🚚 **Transports**: SSE (fully implemented) and WebSocket (coming soon).
- 📢 **Emitters**: In-memory for single-instance apps, Redis for scalable, multi-instance deployments.
- 🔌 **Adapters**: Pre-built integrations for Next.js, TanStack Start, Elysia, and Hono.
- 🧑‍💻 **Clients**: React hooks and vanilla JS for easy subscription on the frontend.
- 🧩 **Plugins**: Ready-to-use modules for chat and notifications with helper functions.
- 📈 **Scalable**: Supports channels/topics for targeted event delivery.
- ♻️ **Reconnection**: Built-in retry logic for clients with exponential backoff.

## Installation

Install via npm:

```bash
pnpm add @zap-studio/realtime
# or
npm install @zap-studio/realtime
```

Or via JSR (for Deno):

```bash
jsr add @zap-studio/realtime
```

### Peer Dependencies

Depending on your usage:
- React: `react >=18.0.0` (for React hooks)
- Next.js: `next >=15.0.0`
- Elysia: `elysia >=1.0.0`
- Hono: `hono >=3.0.0`
- TanStack Start: `@tanstack/react-router >=1.0.0`

These are optional and only required if you use the corresponding features.

## Quick Start

### Server Setup (Next.js Example)

Define your event schemas using Zod:

```ts
// lib/events.ts
import { z } from "zod";
import { Events } from "@zap-studio/realtime/server";
import { InMemoryEmitter } from "@zap-studio/realtime/emitters/in-memory";
import type { EventDefinitions } from "@zap-studio/realtime/types";

const emitter = new InMemoryEmitter();

export const MyEvents = {
  message: z.object({ text: z.string(), user: z.string() }),
  notification: z.object({ type: z.enum(["info", "error"]), message: z.string() }),
} satisfies EventDefinitions;

export const events = new Events(emitter, MyEvents);
```

Create an SSE route:

```ts
// app/api/events/route.ts
import { nextSSERoute } from "@zap-studio/realtime/adapters/next/sse";
import { events } from "@/lib/events";
import type { ExtractEventDefinitions } from "@zap-studio/realtime/types";

export const GET = nextSSERoute<ExtractEventDefinitions<typeof events>>(events);
```

Publish events:

```ts
// some-service.ts
import { events } from "@/lib/events";

await events.publish("message", { text: "Hello!", user: "Alice" });
```

### Client Setup (React Example)

Subscribe to events:

```tsx
// components/Chat.tsx
import { z } from "zod";
import { useSSE } from "@zap-studio/realtime/client/react/sse";

const MyEvents = {
  message: z.object({ text: z.string(), user: z.string() }),
};

function Chat() {
  const { on, connected, error } = useSSE("/api/events", MyEvents);

  useEffect(() => {
    const unsubscribe = on("message", (data) => {
      console.log(`${data.user}: ${data.text}`);
    });
    return unsubscribe;
  }, [on]);

  if (error) return <div>Error: {error.message}</div>;
  if (!connected) return <div>Connecting...</div>;

  return <div>Listening for messages...</div>;
}
```

## Advanced Usage

### Emitters

- **In-Memory**: For development or single-server apps.
  
  ```ts
  import { InMemoryEmitter } from "@zap-studio/realtime/emitters/in-memory";
  const emitter = new InMemoryEmitter();
  ```

- **Redis**: For production with multiple servers. **Provide your own Redis client that conforms to the `RedisClient` interface**.

  ```ts
  import { RedisEmitter, type RedisClient } from "@zap-studio/realtime/emitters/redis";

  const redis: RedisClient = /* your Redis client instance here */;
  const emitter = new RedisEmitter({ publisher: redis });
  ```
  
  If your Redis client does not match the interface, you may need to wrap or adapt it.
  
  ```ts
  // Example of wrapping a non-conforming Redis client
  import { Redis } from "ioredis";
  import { RedisEmitter } from "@zap-studio/realtime/emitters/redis";

  const redis = new Redis();
  const wrappedRedis = {
    publish: (channel: string, message: string) => redis.publish(channel, message),
    subscribe: (channel: string, callback: (message: string) => void) => redis.subscribe(channel, callback),
    unsubscribe: (channel: string) => redis.unsubscribe(channel),
  };

  const emitter = new RedisEmitter({ publisher: wrappedRedis });
  ```
  
  Here is the full `RedisClient` type:

  ```ts
  type RedisClient = {
    publish(channel: string, message: string): Promise<number>;
    subscribe(channel: string): Promise<void>;
    unsubscribe(channel: string): Promise<void>;
    on(event: "message", callback: (channel: string, message: string) => void): void;
    on(event: "error", callback: (error: Error) => void): void;
    quit(): Promise<void>;
    duplicate(): RedisClient;
  };
  ```

### Channels

Publish and subscribe to specific channels:

```ts
// Publish
await events.publish("message", { text: "Hi" }, { channel: "room:123" });

// Subscribe (client)
useEvents("/api/events?channel=room:123", MyEvents);
```

For dynamic channels in routes, use adapters like `nextSSERouteWithParams`.

### Plugins

#### Chat Plugin

```ts
import { createChatPlugin } from "@zap-studio/realtime/plugins/chat/server";
import { z } from "zod";
import { createChatEventsSchema } from "@zap-studio/realtime/plugins/chat";

const ChatEvents = createChatEventsSchema({
  object: z.object,
  string: () => z.string(),
  number: () => z.number(),
  boolean: () => z.boolean(),
  enum: z.enum,
  optional: (schema) => schema.optional(),
  record: (schema) => z.record(z.string(), schema),
  unknown: () => z.unknown(),
});

const chatPlugin = createChatPlugin(ChatEvents);
const chat = chatPlugin.createHelpers(emitter);

await chat.sendMessage("chat-123", "user-456", "Alice", "Hello!");
```

#### Notifications Plugin

Similar to chat, use `createNotificationsPlugin` for notifications.

### Client Options

Customize reconnection:

```ts
useSSE(url, schemas, {
  reconnect: {
    enabled: true,
    maxAttempts: 10,
    delay: 2000,
    maxDelay: 30000,
    multiplier: 1.5,
  },
});
```

### Vanilla JS Client

```ts
import { createVanillaSSEClient } from "@zap-studio/realtime/client/vanilla/sse";

const client = createVanillaSSEClient(url, schemas);
client.on("message", (data) => console.log(data));
```
