# Error handling

`EventBus` does not log to `console` by default. Provide a logger from
`@zap-studio/logging` to control how handler errors are reported.

Install `@zap-studio/logging` only if you plan to pass a logger.

Any `AbstractLogger` subclass is compatible here (for example `ConsoleLogger`).

## Use a logger

```ts
import { ConsoleLogger } from "@zap-studio/logging/console";

const events = new EventBus<AppEvents>({
  logger: new ConsoleLogger(),
});
```

If you want a small custom logger, implement the full `ILogger` surface:

```ts
import type { ILogger } from "@zap-studio/logging";

type EventBusContext = {
  event: keyof AppEvents;
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

const events = new EventBus<AppEvents>({ logger });
```

For a full step‑by‑step guide, see the
[`@zap-studio/logging` documentation](/packages/logging/).
