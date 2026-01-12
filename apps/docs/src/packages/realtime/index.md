# @zap-studio/realtime

A type-safe real-time event streaming library with SSE and WebSocket support.

## Why @zap-studio/realtime?

Building real-time features is complex. You need to handle connections, reconnection logic, event validation, and type safety across your entire stack.

**Before:**

```typescript
// Server: No type safety, manual event handling
const eventSource = new EventSource("/api/events");
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data); // 😱 Unknown type
  // Hope the data has the fields you expect...
};
```

**After:**

```typescript
import { useSSE } from "@zap-studio/realtime/client/react/sse";
import { z } from "zod";

const MyEvents = {
  message: z.object({ content: z.string(), sender: z.string() }),
  notification: z.object({ title: z.string(), body: z.string() }),
};

function ChatComponent() {
  const { on, connected } = useSSE("/api/events", MyEvents);

  useEffect(() => {
    return on("message", (msg) => {
      // ✨ Full type safety! msg.content and msg.sender are typed
      console.log(`${msg.sender}: ${msg.content}`);
    });
  }, [on]);
}
```

## Features

- **Type-safe events** with automatic TypeScript inference
- **Runtime validation** using Standard Schema (Zod, Valibot, ArkType, TypeBox)
- **SSE & WebSocket support** with automatic reconnection
- **Framework adapters** for Next.js, Hono, Elysia, and TanStack Start
- **React hooks** for easy client-side integration
- **Pub/Sub emitters** with in-memory and Redis backends
- **Built-in plugins** for chat and notifications
- **Schema presets** for quick setup with popular validation libraries

## Installation

```bash
pnpm add @zap-studio/realtime
# or
npm install @zap-studio/realtime
```

## Quick Start

### 1. Define Your Event Schemas

```typescript
// lib/events.ts
import { z } from "zod";
import { Events } from "@zap-studio/realtime/server";
import { InMemoryEmitter } from "@zap-studio/realtime/emitters/in-memory";

const eventSchemas = {
  message: z.object({
    id: z.string(),
    content: z.string(),
    sender: z.string(),
    timestamp: z.number(),
  }),
  userJoined: z.object({
    userId: z.string(),
    userName: z.string(),
  }),
};

const emitter = new InMemoryEmitter();
export const events = new Events(eventSchemas, emitter);
```

### 2. Create a Server Endpoint

Using Next.js App Router:

```typescript
// app/api/events/route.ts
import { events } from "@/lib/events";
import { nextSSERoute } from "@zap-studio/realtime/adapters/next/sse";

export const GET = nextSSERoute(events);
```

### 3. Subscribe on the Client

```tsx
// components/Chat.tsx
import { useSSE } from "@zap-studio/realtime/client/react/sse";
import { eventSchemas } from "@/lib/events";

function Chat() {
  const { on, connected, error } = useSSE("/api/events", eventSchemas);

  useEffect(() => {
    const unsubscribe = on("message", (msg) => {
      console.log(`New message: ${msg.content}`);
    });
    return unsubscribe;
  }, [on]);

  if (!connected) return <div>Connecting...</div>;
  return <div>Connected and listening for messages!</div>;
}
```

### 4. Publish Events from the Server

```typescript
// In your API route or server action
import { events } from "@/lib/events";

await events.publish("message", {
  id: crypto.randomUUID(),
  content: "Hello, world!",
  sender: "System",
  timestamp: Date.now(),
});
```

## What's Next?

- [SSE Transport](/packages/realtime/sse) — Server-Sent Events for one-way streaming
- [WebSocket Transport](/packages/realtime/websocket) — Bidirectional real-time communication
- [Schema Presets](/packages/realtime/presets) — Quick setup with Zod, Valibot, or ArkType
- [React Hooks](/packages/realtime/react-hooks) — Client-side integration with React
- [Framework Adapters](/packages/realtime/adapters) — Next.js, Hono, Elysia, TanStack Start
- [Plugins](/packages/realtime/plugins) — Pre-built chat and notification systems
- [Emitters](/packages/realtime/emitters) — In-memory and Redis pub/sub backends
