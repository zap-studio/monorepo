# Emitters

Emitters handle the pub/sub mechanism for distributing events to subscribers.

## Available Emitters

| Emitter | Use Case |
|---------|----------|
| In-Memory | Development, single-instance deployments |
| Redis | Production, multi-instance deployments |

## In-Memory Emitter

The simplest emitter, perfect for development and single-server deployments.

```typescript
import { InMemoryEmitter } from "@zap-studio/realtime/emitters/in-memory";
import { Events } from "@zap-studio/realtime/server";

const emitter = new InMemoryEmitter();
const events = new Events(eventSchemas, emitter);

// Publish events
await events.publish("notification", { title: "Hello!" });

// Subscribe to events
for await (const event of events.subscribe()) {
  console.log(event);
}
```

### Limitations

- Events are lost on server restart
- Only works within a single process
- Not suitable for horizontal scaling

## Redis Emitter

For production deployments with multiple server instances.

```typescript
import { RedisEmitter } from "@zap-studio/realtime/emitters/redis";
import { Events } from "@zap-studio/realtime/server";
import { createClient } from "redis";

// Create Redis client
const redis = createClient({ url: "redis://localhost:6379" });
await redis.connect();

// Create emitter with Redis
const emitter = new RedisEmitter(redis, {
  prefix: "myapp:realtime:", // Optional channel prefix
});

const events = new Events(eventSchemas, emitter);
```

### Features

- Events distributed across all instances
- Survives individual instance restarts
- Supports channel prefixes for multi-tenant apps
- Automatic serialization/deserialization

### Configuration

```typescript
const emitter = new RedisEmitter(redis, {
  prefix: "app:events:",  // Prefix for Redis channels
});
```

### Multi-Instance Example

```typescript
// Instance 1: API Server
const events1 = new Events(schemas, new RedisEmitter(redis));
await events1.publish("notification", { title: "From API" });

// Instance 2: Worker
const events2 = new Events(schemas, new RedisEmitter(redis));
for await (const event of events2.subscribe()) {
  // Receives events from Instance 1
  console.log(event);
}

// Instance 3: WebSocket Server
const events3 = new Events(schemas, new RedisEmitter(redis));
const { manager } = honoWSHandler(events3);
// Broadcasts events from any instance to WebSocket clients
```

## Channels

Both emitters support channels for scoped event delivery.

```typescript
// Publish to a specific channel
await events.publish("message", { content: "Hello" }, {
  channel: "chat:room-123",
});

// Subscribe to a specific channel
const subscription = events.subscribe({
  channel: "chat:room-123",
});

for await (const event of subscription) {
  // Only receives events from chat:room-123
}
```

### Channel Patterns

```typescript
// User-specific channels
await events.publish("notification", data, { channel: `user:${userId}` });

// Room channels
await events.publish("message", data, { channel: `room:${roomId}` });

// Topic channels
await events.publish("update", data, { channel: `topic:${topicName}` });
```

## Event Filtering

Filter events on the subscription side:

```typescript
const subscription = events.subscribe({
  filter: (event) => {
    // Only receive high-priority notifications
    return event.event === "notification" && event.data.priority === "high";
  },
});
```

## Custom Emitters

Create custom emitters by extending `BaseServerEmitter`:

```typescript
import { BaseServerEmitter } from "@zap-studio/realtime/emitters";
import type { EventMessage, SubscribeOptions, PublishOptions } from "@zap-studio/realtime/types";

class MyCustomEmitter<T extends EventDefinitions> extends BaseServerEmitter<T> {
  async *subscribe(options?: SubscribeOptions): AsyncGenerator<EventMessage<T>> {
    // Implement subscription logic
  }

  async publish<K extends keyof T>(
    event: K,
    data: T[K],
    options?: PublishOptions
  ): Promise<void> {
    // Implement publish logic
  }

  close(): void {
    // Cleanup resources
  }
}
```

## Best Practices

### Use Redis in Production

```typescript
const emitter = process.env.NODE_ENV === "production"
  ? new RedisEmitter(redis)
  : new InMemoryEmitter();
```

### Handle Emitter Cleanup

```typescript
// Graceful shutdown
process.on("SIGTERM", () => {
  emitter.close();
  redis.disconnect();
});
```

### Use Channel Prefixes for Multi-Tenancy

```typescript
// Separate tenants with prefixes
const emitter = new RedisEmitter(redis, {
  prefix: `tenant:${tenantId}:`,
});
```
