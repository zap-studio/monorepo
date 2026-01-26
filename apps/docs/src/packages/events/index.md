# @zap-studio/events

A lightweight event bus used by `@zap-studio/waitlist` for join, referral, leave, and error hooks.

## Installation

```bash
pnpm add @zap-studio/events
# or
npm install @zap-studio/events
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
```

## Event Types

Define an event map and pass it to `EventBus<TEvents>` so handlers are fully typed.

If you use `@zap-studio/waitlist`, the waitlist event map is exported as `WaitlistEventPayloadMap`.

## Error Reporting

`EventBus` does not log to `console` by default. Provide a logger or callback to control how errors are reported when handlers throw.

```ts
import { EventBus } from "@zap-studio/events";
import type { ErrorReporter, ILogger } from "@zap-studio/events/types";

type AppEvents = {
  joined: { email: string };
  error: { err: unknown; source: keyof AppEvents };
};

const logger: ILogger<AppEvents> = {
  error: (message, err, context) => {
    console.error(message, err, context);
  },
};

const onError: ErrorReporter<AppEvents> = (err, { event, errorEmitFailed }) => {
  console.error("EventBus error", { event, err, errorEmitFailed });
};

const events = new EventBus<AppEvents>({
  logger,
  onError,
  errorEventType: "error",
  errorEventPayload: (err, source) => ({ err, source }),
});
```
