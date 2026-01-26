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

## AbstractLogger

The package provides a base class with shared behavior and a minimal logging
contract you can extend in your runtime.

```ts
import { AbstractLogger, type LogLevel } from "@zap-studio/logging";

type AppContext = {
  requestId: string;
  userId?: string;
};

class AppLogger extends AbstractLogger<Error, AppContext> {
  protected write(level: LogLevel, message: string, context?: Partial<AppContext>, err?: Error) {
    // Forward to your logging backend.
  }
}
```

Enable timestamps with the `LoggerOptions` constructor.

```ts
const logger = new AppLogger({ timestamp: true });
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
