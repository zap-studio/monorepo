# Error handling

`EventBus` does not log to `console` by default. Provide a logger or `onError` callback to control how handler errors are reported.

## Emit a typed error event

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
```

When a handler throws, the bus will emit `error` with `{ err, source }`.

## Use onError or logger

```ts
import type { ErrorReporter, ILogger } from "@zap-studio/events/types";

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

`onError` takes precedence over `logger`.
