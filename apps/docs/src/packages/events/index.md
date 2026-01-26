# @zap-studio/events

A lightweight, typed event bus for Node and browser runtimes.

- **Typed by default** with a simple event map
- **Small API surface**: `on`, `once`, `off`, `emit`, `clear`, `listenerCount`
- **Optional error handling** with typed error events and an optional logger

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
};

const events = new EventBus<AppEvents>();

events.on("joined", ({ email }) => {
  console.log(`${email} joined`);
});

await events.emit("joined", { email: "user@example.com" });
```
