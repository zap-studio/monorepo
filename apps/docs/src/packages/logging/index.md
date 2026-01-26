# @zap-studio/logging

Minimal logging interfaces for Zap Studio runtimes, plus a ready-to-use console logger.

## Installation

```bash
pnpm add @zap-studio/logging
# or
npm install @zap-studio/logging
# or
bun add @zap-studio/logging
```

## ConsoleLogger

`ConsoleLogger` is a lightweight adapter that sends logs to the console with
standardized prefixes.

```ts
import { ConsoleLogger } from "@zap-studio/logging/console";

const logger = new ConsoleLogger();

logger.info("Connected", { requestId: "req-1" });
logger.warn("Retrying request", { requestId: "req-1" });
logger.error("Failed to connect", new Error("Network error"), {
  requestId: "req-1",
});
```

Enable timestamps:

```ts
const logger = new ConsoleLogger({ timestamp: true });
logger.info("Message");
```

With `{ timestamp: true }`, `ConsoleLogger` prefixes messages with an ISO 8601
UTC timestamp:

```
[INFO] 2025-01-26T19:44:00.123Z Message
```

## Custom Logger (step by step)

If you need to forward logs to a third-party service (Datadog, Sentry, custom
backend), extend `AbstractLogger` and implement the low‑level `write()` method.

### 1) Define your context

```ts
type AppContext = {
  requestId: string;
  userId?: string;
};
```

### 2) Extend AbstractLogger

```ts
import { AbstractLogger, type LogLevel } from "@zap-studio/logging";

class AppLogger extends AbstractLogger<Error, AppContext> {
  protected write(
    level: LogLevel,
    message: string,
    context?: Partial<AppContext>,
    err?: Error
  ) {
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: err
        ? { name: err.name, message: err.message, stack: err.stack }
        : undefined,
    };

    console.log(JSON.stringify(logEntry));
  }
}
```

### 3) Instantiate and use

```ts
const logger = new AppLogger({ timestamp: true });

logger.info("User logged in", { requestId: "req-1", userId: "user-1" });
logger.error("Checkout failed", new Error("Card declined"), {
  requestId: "req-1",
});
```
