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

`ConsoleLogger` sends logs to the console with standardized prefixes.

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
```

## Custom Logger (step by step)

Use the `AbstractLogger` base class to implement a logger that can be shared
across packages and runtimes.

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
    // Forward to your logging backend.
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
