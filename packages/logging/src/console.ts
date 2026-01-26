import type { ILogger, LogLevel } from ".";

export class ConsoleLogger implements ILogger {
  log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): void {
    switch (level) {
      case "info":
        console.log(`[INFO] ${message}`, context);
        break;
      case "warn":
        console.warn(`[WARN] ${message}`, context);
        break;
      case "error":
        console.error(`[ERROR] ${message}`, context);
        break;
      default:
        console.log(`[UNKNOWN] ${message}`, context);
        break;
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.log(`[INFO] ${message}`, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, context);
  }

  error(
    message: string,
    err: unknown,
    context?: Record<string, unknown>
  ): void {
    console.error(`[ERROR] ${message}`, err, context);
  }
}
