# SSE Transport

Server-Sent Events (SSE) provide a simple, reliable way to stream events from server to client.

## Overview

SSE is ideal for:
- Live notifications
- Real-time updates (stock prices, scores, etc.)
- Activity feeds
- Server-to-client only communication

## Server Setup

### Basic Server Transport

```typescript
import { SSEServerTransport } from "@zap-studio/realtime/transport/sse/server";
import { Events } from "@zap-studio/realtime/server";
import { InMemoryEmitter } from "@zap-studio/realtime/emitters/in-memory";
import { z } from "zod";

const eventSchemas = {
  notification: z.object({
    title: z.string(),
    message: z.string(),
  }),
};

const emitter = new InMemoryEmitter();
const events = new Events(eventSchemas, emitter);

// Create transport with custom heartbeat interval
const transport = new SSEServerTransport({
  heartbeatInterval: 30000, // 30 seconds
});

// Create response from subscription
const response = transport.createResponse(events.subscribe(), {
  signal: request.signal,
});
```

## Client Setup

On the client, you can use Vanilla JavaScript or React Hooks, which provide convenient wrappers around `EventSource`.

Learn more about [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource).

### Vanilla JavaScript

```typescript
import { createVanillaSSEClient } from "@zap-studio/realtime/client/vanilla";
import { z } from "zod";

const schemas = {
  notification: z.object({
    title: z.string(),
    message: z.string(),
  }),
};

const client = createVanillaSSEClient("/api/events", schemas);

// Listen to events
client.on("notification", (data) => {
  console.log(`${data.title}: ${data.message}`);
});

// Handle connection state
client.onConnectionChange((connected) => {
  console.log("Connected:", connected);
});

// Handle errors
client.onError((error) => {
  console.error("SSE error:", error);
});

// Cleanup
client.disconnect();
```

### React Hooks

```tsx
import { useEvents, useEvent, useEventHistory } from "@zap-studio/realtime/client/react/hooks";

// Basic usage
function Notifications() {
  const { on, connected, error } = useEvents("/api/events", schemas);

  useEffect(() => {
    on("notification", (data) => {
      toast.show(data.title, data.message);
    });
  }, [on]);

  return <div>Status: {connected ? "Connected" : "Disconnected"}</div>;
}

// Single event with state
function LatestNotification() {
  const { data, connected } = useEvent("/api/events", "notification", schemas);

  if (!data) return <div>Waiting for notifications...</div>;
  return <div>{data.title}: {data.message}</div>;
}

// Event history
function NotificationList() {
  const { events, clear } = useEventHistory("/api/events", "notification", schemas, {
    maxEvents: 50,
  });

  return (
    <div>
      <button onClick={clear}>Clear</button>
      {events.map((event, i) => (
        <div key={i}>{event.title}</div>
      ))}
    </div>
  );
}
```

## Configuration

### Server Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `heartbeatInterval` | `number` | `30000` | Interval for keep-alive heartbeats (ms) |
| `headers` | `Record<string, string>` | `{}` | Custom headers for the response |
| `signal` | `AbortSignal` | - | Signal to abort the stream |

### Client Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `validate` | `boolean` | `true` | Validate incoming events |
| `reconnect.enabled` | `boolean` | `true` | Enable automatic reconnection |
| `reconnect.maxAttempts` | `number` | `Infinity` | Max reconnection attempts |
| `reconnect.delay` | `number` | `1000` | Initial reconnection delay (ms) |
| `reconnect.maxDelay` | `number` | `30000` | Maximum reconnection delay (ms) |
| `reconnect.multiplier` | `number` | `2` | Exponential backoff multiplier |

## Best Practices

1. **Use channels for scoping** — Subscribe to specific channels to reduce unnecessary traffic
2. **Enable validation** — Always validate incoming events to catch API changes early
3. **Handle disconnections** — Use `onConnectionChange` to update UI state
4. **Clean up subscriptions** — Always return the unsubscribe function from `useEffect`
