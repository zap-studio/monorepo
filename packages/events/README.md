# @zap-studio/events

A lightweight, typed event bus for Node and browser runtimes.

## Installation

```bash
pnpm add @zap-studio/events
# or
npm install @zap-studio/events
# or
bun add @zap-studio/events
```

## Quick Start

```ts
import { EventBus } from "@zap-studio/events";

type AppEvents = {
  joined: { email: string };
  error: { err: unknown; source: keyof AppEvents };
};

const events = new EventBus<AppEvents>({
  errorEventType: "error",
  errorEventPayload: (err, source) => ({ err, source }),
});

events.on("joined", ({ email }) => {
  console.log(`${email} joined`);
});

await events.emit("joined", { email: "user@example.com" });
```

## Core Concepts

### Event maps

`EventBus<TEvents>` is typed with a simple event map. Each key is an event name, each value is the payload type.

```ts
type Events = {
  created: { id: string };
  deleted: { id: string; reason?: string };
  error: { err: unknown; source: keyof Events };
};
```

### Subscribing and unsubscribing

```ts
const off = events.on("created", ({ id }) => {
  console.log(id);
});

off();
```

Use `once()` for one-time handlers:

```ts
events.once("deleted", ({ id }) => {
  console.log("first delete", id);
});
```

### Error handling

If a handler throws, the bus can emit a typed error event. You can also provide a logger or `onError` callback.

```ts
import type { ErrorReporter, ILogger } from "@zap-studio/events/types";

type Events = {
  created: { id: string };
  error: { err: unknown; source: keyof Events };
};

const logger: ILogger<Events> = {
  error: (message, err, context) => {
    console.error(message, err, context);
  },
};

const onError: ErrorReporter<Events> = (err, { event, errorEmitFailed }) => {
  console.error("EventBus error", { event, err, errorEmitFailed });
};

const events = new EventBus<Events>({
  logger,
  onError,
  errorEventType: "error",
  errorEventPayload: (err, source) => ({ err, source }),
});
```

## Utilities

- `clear(type?)` removes handlers
- `listenerCount(type)` reports handlers per event
