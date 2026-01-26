import { AbstractLogger, type LogLevel } from ".";

/**
 * Logger that writes to the Node.js and browser consoles.
 */
export class ConsoleLogger extends AbstractLogger {
  protected write(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    err?: unknown
  ): void {
    switch (level) {
      case "info":
        console.log(message, context);
        break;
      case "warn":
        console.warn(message, context);
        break;
      case "error":
        if (err === undefined) {
          console.error(message, context);
          break;
        }
        console.error(message, err, context);
        break;
      default:
        console.log(message, context);
        break;
    }
  }
}
