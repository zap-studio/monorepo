# @zap-studio/events

A lightweight, typed event bus for Node and browser runtimes.

- **Typed by default** with a simple event map
- **Small API surface**: `on`, `once`, `off`, `emit`, `clear`, `listenerCount`
- **Optional error handling** with typed error events, logger, or callbacks

## Installation

```bash
pnpm add @zap-studio/events
# or
npm install @zap-studio/events
```

## Getting started

Define an event map, create a bus, then emit and subscribe.

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
