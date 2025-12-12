# @zap-studio/realtime

A type-safe real-time event streaming library with SSE support.

## Why @zap-studio/realtime?

**Before:**

```typescript
const eventSource = new EventSource("/api/events");
eventSource.onmessage = (e) => {
  const data = JSON.parse(e.data); // unknown type
  console.log(data.title); // no type safety
};
```

**After:**

```typescript
const client = createVanillaSSEClient("/api/events", MyEvents);
client.on("message", (data) => {
  console.log(data.title); // fully typed
});
```

## Features

- **Type-safe events** with automatic type inference
- **Runtime validation** using Standard Schema (Zod, Valibot, ArkType, etc.)
- **SSE transport** with heartbeat and reconnection support
- **Framework adapters** for Next.js, Hono, Elysia, TanStack Start
- **Client adapters** for Vanilla JS, React, and Zustand
- **Emitters** for in-memory (dev) and Redis (production)
- **Plugins** for notifications and chat

## Installation

```bash
pnpm add @zap-studio/realtime
```

## Quick Start

### 1. Define your events

```typescript
import { z } from "zod";

export const MyEvents = {
  message: z.object({ title: z.string(), body: z.string() }),
  userPresence: z.object({ userId: z.string(), online: z.boolean() }),
};
```

### 2. Server (Next.js App Router)

```typescript
// app/api/events/route.ts
import { nextSSERoute } from "@zap-studio/realtime/adapters/next/sse";
import { createInMemoryEmitter } from "@zap-studio/realtime/emitters";

const emitter = createInMemoryEmitter();

export const GET = nextSSERoute(() => emitter.subscribe());

// Publish from anywhere
await emitter.publish("message", { title: "Hello", body: "World" });
```

### 3. Client (React)

```typescript
import { useEvent } from "@zap-studio/realtime/client/react/hooks";
import { MyEvents } from "./events";

function Chat() {
  const { data, connected } = useEvent("/api/events", "message", MyEvents);

  if (!connected) return <div>Connecting...</div>;
  if (!data) return <div>Waiting for messages...</div>;

  return <div>{data.title}: {data.body}</div>;
}
```

## Adapters

### Server

```typescript
// Next.js
import { nextSSERoute } from "@zap-studio/realtime/adapters/next/sse";

// Hono
import { honoSSEHandler } from "@zap-studio/realtime/adapters/hono/sse";

// Elysia
import { elysiaSSEHandler } from "@zap-studio/realtime/adapters/elysia/sse";

// TanStack Start
import { tanstackSSEHandler } from "@zap-studio/realtime/adapters/tanstack/sse";
```

### Client

```typescript
// Vanilla JS
import { createVanillaSSEClient } from "@zap-studio/realtime/client/vanilla";

// React
import { useEvents } from "@zap-studio/realtime/client/react/hooks";

// Zustand
import { createEventsStore } from "@zap-studio/realtime/client/zustand";
```

## Emitters

```typescript
// Development
import { createInMemoryEmitter } from "@zap-studio/realtime/emitters";
const emitter = createInMemoryEmitter();

// Production (Redis)
import { createRedisEmitter } from "@zap-studio/realtime/emitters";
const emitter = createRedisEmitter({ publisher: redisClient });
```
