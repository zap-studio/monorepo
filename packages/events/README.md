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
};

const events = new EventBus<AppEvents>();

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

If a handler throws, the bus can report it to an optional logger from
`@zap-studio/logging`. Any `AbstractLogger` subclass works here (for example
`ConsoleLogger`).

Install `@zap-studio/logging` only if you plan to pass a logger.

```ts
import { ConsoleLogger } from "@zap-studio/logging/console";

type Events = {
  created: { id: string };
  error: { err: unknown; source: keyof Events };
};

const events = new EventBus<Events>({
  logger: new ConsoleLogger(),
});
```

If you want a tiny custom logger, implement the full `ILogger` surface:

```ts
import type { ILogger } from "@zap-studio/logging";

type EventBusContext = {
  event: keyof Events;
};

const logger: ILogger<unknown, EventBusContext> = {
  log: (level, message, context) => {
    console.log(level, message, context);
  },
  info: (message, context) => {
    console.log(message, context);
  },
  warn: (message, context) => {
    console.warn(message, context);
  },
  error: (message, err, context) => {
    console.error(message, err, context);
  },
};

const events = new EventBus<Events>({ logger });
```

For a full step-by-step guide, see the `@zap-studio/logging` documentation.

## Utilities

- `clear(type?)` removes handlers
- `listenerCount(type)` reports handlers per event
