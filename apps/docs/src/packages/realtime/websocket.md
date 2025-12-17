# WebSocket Transport

WebSocket provides bidirectional, full-duplex communication between client and server.

## Overview

WebSocket is ideal for:
- Chat applications
- Real-time collaboration
- Gaming
- Any scenario requiring bidirectional communication

## Server Setup

### Basic WebSocket Server

```typescript
import { WSServerTransport, WSConnectionManager } from "@zap-studio/realtime/transport/ws/server";
import { Events } from "@zap-studio/realtime/server";
import { InMemoryEmitter } from "@zap-studio/realtime/emitters/in-memory";
import { z } from "zod";

const eventSchemas = {
  message: z.object({
    content: z.string(),
    sender: z.string(),
  }),
};

const emitter = new InMemoryEmitter();
const events = new Events(eventSchemas, emitter);

// Create transport
const transport = new WSServerTransport({
  pingInterval: 30000,
  pongTimeout: 10000,
});

// Create connection manager for broadcasting
const manager = new WSConnectionManager();
```

## Client Setup

On the client, you can use Vanilla JavaScript or React Hooks.

### Vanilla JavaScript

```typescript
import { createVanillaWSClient } from "@zap-studio/realtime/client/vanilla/ws";
import { z } from "zod";

const schemas = {
  message: z.object({
    content: z.string(),
    sender: z.string(),
  }),
};

const client = createVanillaWSClient("wss://example.com/ws", schemas);

// Listen to events
client.on("message", (data) => {
  console.log(`${data.sender}: ${data.content}`);
});

// Send messages to server
client.send("message", { content: "Hello!", sender: "Me" });

// Subscribe to a channel
client.subscribe("chat:room-123");

// Handle connection state
client.onConnectionChange((connected) => {
  console.log("Connected:", connected);
});

// Cleanup
client.disconnect();
```

Using a factory for multiple connections:

```typescript
import { createWSClientFactory } from "@zap-studio/realtime/client/vanilla/ws";

const createClient = createWSClientFactory(schemas, {
  reconnect: { maxAttempts: 5 },
});

const room1Client = createClient("wss://example.com/ws/room1");
const room2Client = createClient("wss://example.com/ws/room2");
```

### React Hooks

```tsx
import { 
  useWebSocket, 
  useWebSocketEvent, 
  useWebSocketEventHistory 
} from "@zap-studio/realtime/client/react/ws";

// Basic usage with send capability
function Chat() {
  const { on, send, connected, error } = useWebSocket(
    "wss://example.com/ws", 
    schemas
  );

  useEffect(() => {
    on("message", (msg) => {
      console.log(`${msg.sender}: ${msg.content}`);
    });
  }, [on]);

  const sendMessage = (content: string) => {
    send("message", { content, sender: "Me" });
  };

  return (
    <div>
      <button onClick={() => sendMessage("Hello!")}>Send</button>
    </div>
  );
}

// Single event with send
function MessageInput() {
  const { data, send, connected } = useWebSocketEvent(
    "wss://example.com/ws",
    "message",
    schemas
  );

  return (
    <div>
      <p>Last: {data?.content}</p>
      <button onClick={() => send({ content: "Hi!", sender: "Me" })}>
        Send
      </button>
    </div>
  );
}

// Event history for chat
function ChatHistory() {
  const { events, send, clear } = useWebSocketEventHistory(
    "wss://example.com/ws",
    "message",
    schemas,
    { maxEvents: 100 }
  );

  return (
    <div>
      {events.map((msg, i) => (
        <div key={i}>{msg.sender}: {msg.content}</div>
      ))}
      <button onClick={() => send({ content: "New message", sender: "Me" })}>
        Send
      </button>
      <button onClick={clear}>Clear</button>
    </div>
  );
}
```

## Connection Manager API

The `WSConnectionManager` provides powerful broadcasting capabilities:

```typescript
const manager = new WSConnectionManager<typeof schemas>();

// Add a connection
manager.add(connectionHandler);

// Remove a connection
manager.remove(connectionId);

// Subscribe to channels
manager.subscribe(connectionId, "chat:room-1");
manager.unsubscribe(connectionId, "chat:room-1");

// Broadcast to all
manager.broadcast("message", { content: "Hello all!", sender: "System" });

// Broadcast to channel
manager.broadcastToChannel("chat:room-1", "message", { 
  content: "Hello room!", 
  sender: "System" 
});

// Send to specific connection
manager.sendTo(connectionId, "message", { 
  content: "Private message", 
  sender: "System" 
});

// Get connection info
const ids = manager.getConnectionIds();
const count = manager.size;

// Close all connections
manager.closeAll(1000, "Server shutting down");
```

## Configuration

### Server Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pingInterval` | `number` | `30000` | Interval for ping keep-alive (ms) |
| `pongTimeout` | `number` | `10000` | Timeout waiting for pong (ms) |

### Client Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `validate` | `boolean` | `true` | Validate incoming events |
| `protocols` | `string \| string[]` | - | WebSocket sub-protocols |
| `reconnect.enabled` | `boolean` | `true` | Enable automatic reconnection |
| `reconnect.maxAttempts` | `number` | `Infinity` | Max reconnection attempts |
| `reconnect.delay` | `number` | `1000` | Initial reconnection delay (ms) |
| `reconnect.maxDelay` | `number` | `30000` | Maximum reconnection delay (ms) |
| `reconnect.multiplier` | `number` | `2` | Exponential backoff multiplier |

## WebSocket vs SSE

| Feature | WebSocket | SSE |
|---------|-----------|-----|
| Direction | Bidirectional | Server to client only |
| Protocol | WebSocket | HTTP |
| Reconnection | Manual (built-in) | Automatic (browser) |
| Binary data | Yes | No (text only) |
| Complexity | Higher | Lower |
| Best for | Chat, games, collaboration | Notifications, feeds, updates |

## Best Practices

1. **Use channels** — Organize connections into logical groups for targeted broadcasting
2. **Handle reconnection** — The client automatically reconnects, but update your UI accordingly
3. **Validate messages** — Enable validation to catch protocol mismatches early
4. **Clean up** — Always disconnect clients when components unmount
5. **Use connection IDs** — Track and manage individual connections for targeted messaging
