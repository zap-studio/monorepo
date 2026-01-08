# Framework Adapters

Adapters provide seamless integration with popular web frameworks for both SSE and WebSocket transports.

## Supported Frameworks

| Framework | SSE | WebSocket |
|-----------|-----|-----------|
| Next.js | ✅ | ✅ (custom server) |
| Hono | ✅ | ✅ |
| Elysia | ✅ | ✅ |
| TanStack Start | ✅ | ✅ |

## Next.js

### SSE

```typescript
// app/api/events/route.ts
import { nextSSERoute } from "@zap-studio/realtime/adapters/next/sse";
import { events } from "@/lib/events";

export const GET = nextSSERoute(events);
```

With dynamic params:

```typescript
// app/api/events/[channel]/route.ts
import { nextSSERouteWithParams } from "@zap-studio/realtime/adapters/next/sse";
import { events } from "@/lib/events";

export const GET = nextSSERouteWithParams(events);
```

### WebSocket

Next.js App Router doesn't support WebSocket upgrades directly. Use a custom server.

More on this soon...

## Hono

### SSE

```typescript
import { Hono } from "hono";
import { honoSSEHandler, honoSSEHandlerWithParams } from "@zap-studio/realtime/adapters/hono/sse";
import { events } from "@/lib/events";

const app = new Hono();

app.get("/api/events", honoSSEHandler(events));
app.get("/api/events/:channel", honoSSEHandlerWithParams(events));

export default app;
```

### WebSocket

```typescript
import { Hono } from "hono";
import { upgradeWebSocket } from "hono/cloudflare-workers"; // or bun, deno, etc.
import { honoWSHandler, honoWSHandlerWithChannel } from "@zap-studio/realtime/adapters/hono/ws";
import { events } from "@/lib/events";

const app = new Hono();

// Basic WebSocket
const { wsEvents, manager } = honoWSHandler(events, {
  onConnection: (id) => console.log("Connected:", id),
  onMessage: (id, event, data) => manager.broadcast(event, data),
});

app.get("/ws", upgradeWebSocket(() => wsEvents));

// With channels
const { createWSEvents, manager: channelManager } = honoWSHandlerWithChannel(events);

app.get("/ws/:channel", upgradeWebSocket((c) => 
  createWSEvents(c.req.param("channel"))
));

export default app;
```

## Elysia

### SSE

```typescript
import { Elysia } from "elysia";
import { elysiaSSEHandler, elysiaSSEHandlerWithParams } from "@zap-studio/realtime/adapters/elysia/sse";
import { events } from "@/lib/events";

const app = new Elysia()
  .get("/api/events", elysiaSSEHandler(events))
  .get("/api/events/:channel", elysiaSSEHandlerWithParams(events));

export default app;
```

### WebSocket

```typescript
import { Elysia } from "elysia";
import { elysiaWSHandler, elysiaWSHandlerWithChannel } from "@zap-studio/realtime/adapters/elysia/ws";
import { events } from "@/lib/events";

// Basic WebSocket
const { config, manager } = elysiaWSHandler(events, {
  onConnection: (id) => console.log("Connected:", id),
  onMessage: (id, event, data) => manager.broadcast(event, data),
});

const app = new Elysia()
  .ws("/ws", config);

// With channels
const { createConfig, manager: channelManager } = elysiaWSHandlerWithChannel(events);

const appWithChannels = new Elysia()
  .ws("/ws/:channel", {
    ...createConfig((ws) => ws.data.params.channel),
  });

export default app;
```

## TanStack Start

### SSE

```typescript
// routes/api/events.ts
import { createFileRoute } from "@tanstack/react-router";
import { tanstackStartSSEHandler } from "@zap-studio/realtime/adapters/tanstack/sse";
import { events } from "@/lib/events";

export const Route = createFileRoute("/api/events")({
  server: {
    handlers: {
      GET: tanstackStartSSEHandler(events),
    },
  },
});
```

### WebSocket

```typescript
// lib/ws.ts
import { tanstackWSHandler } from "@zap-studio/realtime/adapters/tanstack/ws";
import { events } from "./events";

export const { handleConnection, manager } = tanstackWSHandler(events, {
  onConnection: (id) => console.log("Connected:", id),
  onMessage: (id, event, data) => manager.broadcast(event, data),
});
```

## Adapter Options

### SSE Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `heartbeatInterval` | `number` | `30000` | Keep-alive interval (ms) |
| `headers` | `Record<string, string>` | `{}` | Custom response headers |

### WebSocket Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pingInterval` | `number` | `30000` | Ping keep-alive interval (ms) |
| `pongTimeout` | `number` | `10000` | Pong response timeout (ms) |
| `onConnection` | `function` | - | Called when client connects |
| `onMessage` | `function` | - | Called when client sends message |
| `onClose` | `function` | - | Called when client disconnects |
| `onError` | `function` | - | Called on errors |

## Using the Connection Manager

All WebSocket adapters provide a `manager` for broadcasting:

```typescript
const { manager } = honoWSHandler(events);

// Broadcast to all connections
manager.broadcast("notification", { title: "Hello!" });

// Broadcast to a channel
manager.broadcastToChannel("room-1", "message", { content: "Hi room!" });

// Send to specific connection
manager.sendTo(connectionId, "private", { content: "Just for you" });

// Get connection count
console.log(`${manager.size} clients connected`);

// Close all connections
manager.closeAll(1000, "Server restarting");
```
