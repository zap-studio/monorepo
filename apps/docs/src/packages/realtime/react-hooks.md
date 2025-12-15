# React Hooks

We provide React Hooks for easy integration with SSE and WebSocket transports.

## SSE Hooks

### useEvents

The primary hook for subscribing to SSE events.

```tsx
import { useEvents } from "@zap-studio/realtime/client/react/hooks";

function MyComponent() {
  const { on, onAny, connected, error, connect, disconnect } = useEvents(
    "/api/events",
    eventSchemas,
    {
      enabled: true,           // Auto-connect on mount
      validate: true,          // Validate incoming events
      reconnect: {
        enabled: true,
        maxAttempts: 10,
        delay: 1000,
      },
    }
  );

  useEffect(() => {
    // Subscribe to specific event
    const unsubscribe = on("notification", (data) => {
      console.log("Notification:", data);
    });

    return unsubscribe; // Always cleanup!
  }, [on]);

  useEffect(() => {
    // Subscribe to all events
    const unsubscribe = onAny((event, data) => {
      console.log(`Event ${event}:`, data);
    });

    return unsubscribe;
  }, [onAny]);

  if (error) return <div>Error: {error.message}</div>;
  if (!connected) return <div>Connecting...</div>;

  return <div>Connected!</div>;
}
```

### useEvent

Hook for subscribing to a single event type with automatic state management.

```tsx
import { useEvent } from "@zap-studio/realtime/client/react/hooks";

function LatestNotification() {
  const { data, connected, error } = useEvent(
    "/api/events",
    "notification",
    eventSchemas
  );

  if (!connected) return <div>Connecting...</div>;
  if (!data) return <div>Waiting for notifications...</div>;

  return (
    <div>
      <h3>{data.title}</h3>
      <p>{data.message}</p>
    </div>
  );
}
```

### useEventHistory

Hook for collecting events into an array (useful for feeds and logs).

```tsx
import { useEventHistory } from "@zap-studio/realtime/client/react/hooks";

function NotificationFeed() {
  const { events, connected, error, clear } = useEventHistory(
    "/api/events",
    "notification",
    eventSchemas,
    { maxEvents: 50 }
  );

  return (
    <div>
      <button onClick={clear}>Clear All</button>
      <ul>
        {events.map((notification, i) => (
          <li key={i}>{notification.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## WebSocket Hooks

### useWebSocket

The primary hook for bidirectional WebSocket communication.

```tsx
import { useWebSocket } from "@zap-studio/realtime/client/react/ws-hooks";

function Chat() {
  const { on, send, subscribe, connected, error, connect, disconnect } = useWebSocket(
    "wss://example.com/ws",
    eventSchemas,
    {
      enabled: true,
      protocols: ["chat"],  // Optional sub-protocols
      reconnect: {
        enabled: true,
        maxAttempts: 10,
      },
    }
  );

  useEffect(() => {
    const unsubscribe = on("message", (msg) => {
      console.log(`${msg.sender}: ${msg.content}`);
    });
    return unsubscribe;
  }, [on]);

  const sendMessage = (content: string) => {
    send("message", { content, sender: "Me" });
  };

  // Subscribe to a channel
  useEffect(() => {
    if (connected) {
      subscribe("chat:room-123");
    }
  }, [connected, subscribe]);

  return (
    <div>
      <input onKeyDown={(e) => {
        if (e.key === "Enter") {
          sendMessage(e.currentTarget.value);
          e.currentTarget.value = "";
        }
      }} />
    </div>
  );
}
```

### useWebSocketEvent

Hook for a single event type with send capability.

```tsx
import { useWebSocketEvent } from "@zap-studio/realtime/client/react/ws-hooks";

function MessageDisplay() {
  const { data, send, connected, error } = useWebSocketEvent(
    "wss://example.com/ws",
    "message",
    eventSchemas
  );

  return (
    <div>
      <p>Last message: {data?.content ?? "None"}</p>
      <button onClick={() => send({ content: "Hello!", sender: "Me" })}>
        Send Hello
      </button>
    </div>
  );
}
```

### useWebSocketEventHistory

Hook for collecting events with send capability.

```tsx
import { useWebSocketEventHistory } from "@zap-studio/realtime/client/react/ws-hooks";

function ChatRoom() {
  const { events, send, connected, error, clear } = useWebSocketEventHistory(
    "wss://example.com/ws",
    "message",
    eventSchemas,
    { maxEvents: 100 }
  );
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      send({ content: input, sender: "Me" });
      setInput("");
    }
  };

  return (
    <div>
      <div className="messages">
        {events.map((msg, i) => (
          <div key={i} className="message">
            <strong>{msg.sender}</strong>: {msg.content}
          </div>
        ))}
      </div>
      <div className="input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
```

## Hook Options

### Common Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Connect on mount |
| `validate` | `boolean` | `true` | Validate incoming events |
| `reconnect.enabled` | `boolean` | `true` | Enable auto-reconnect |
| `reconnect.maxAttempts` | `number` | `Infinity` | Max reconnect attempts |
| `reconnect.delay` | `number` | `1000` | Initial delay (ms) |
| `reconnect.maxDelay` | `number` | `30000` | Max delay (ms) |
| `reconnect.multiplier` | `number` | `2` | Backoff multiplier |

### WebSocket-Specific Options

| Option | Type | Description |
|--------|------|-------------|
| `protocols` | `string \| string[]` | WebSocket sub-protocols |

### History Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxEvents` | `number` | `100` | Max events to keep in history |

## Best Practices

### Always Clean Up Subscriptions

```tsx
useEffect(() => {
  const unsubscribe = on("event", handler);
  return unsubscribe; // Important!
}, [on]);
```

### Use Stable Callbacks

The `on`, `send`, and other functions are memoized and stable across renders.

```tsx
// ✅ Good - on is stable
useEffect(() => {
  return on("event", handler);
}, [on]); // on won't change

// ❌ Bad - creating inline handler every render
on("event", (data) => handleData(data));
```

### Handle Connection States

```tsx
function MyComponent() {
  const { connected, error } = useEvents(url, schemas);

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  if (!connected) {
    return <LoadingSpinner />;
  }

  return <Content />;
}
```

### Conditional Connection

```tsx
function MyComponent({ shouldConnect }) {
  const { connected } = useEvents(url, schemas, {
    enabled: shouldConnect, // Only connect when needed
  });
}
```

### Multiple Event Types

```tsx
function Dashboard() {
  const { on } = useEvents(url, schemas);

  useEffect(() => {
    const unsubs = [
      on("notification", handleNotification),
      on("update", handleUpdate),
      on("alert", handleAlert),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, [on]);
}
```
