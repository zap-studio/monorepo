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

## Specification

Use the `ILogger` interface to implement a logger that can be shared across
packages and runtimes.

```ts
import type { ILogger, LogLevel } from "@zap-studio/logging";

type AppContext = {
  requestId: string;
  userId?: string;
};

class AppLogger implements ILogger<Error, AppContext> {
  log(level: LogLevel, message: string, context?: Partial<AppContext>) {
    // Forward to your logging backend.
  }

  info(message: string, context?: Partial<AppContext>) {}

  warn(message: string, context?: Partial<AppContext>) {}

  error(message: string, err?: Error, context?: Partial<AppContext>) {}
}
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
