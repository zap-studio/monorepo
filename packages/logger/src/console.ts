/**
 * Console-backed `Logger` implementation.
 *
 * @module @zap-studio/logger/console
 */

import { isLevelEnabled } from "./core.js";
import type { CallableLogLevel, Logger, LogLevel } from "./types.js";

const CONSOLE_METHOD_BY_LEVEL: Record<
  CallableLogLevel,
  "debug" | "info" | "warn" | "error"
> = {
  debug: "debug",
  error: "error",
  fatal: "error",
  info: "info",
  trace: "debug",
  warn: "warn",
};

/**
 * Options for {@link ConsoleLogger}.
 */
export interface ConsoleLoggerOptions {
  /**
   * Minimum level that gets printed. Calls below this threshold are no-ops.
   *
   * @default "info"
   */
  readonly minLevel?: LogLevel;
}

/**
 * `Logger` implementation backed by the global `console` object.
 *
 * @example
 * ```ts
 * import { ConsoleLogger } from "@zap-studio/logger";
 *
 * const logger = new ConsoleLogger({ minLevel: "debug" });
 * logger.debug("cache miss", { key: "user:42" });
 * ```
 */
export class ConsoleLogger implements Logger {
  private readonly minLevel: LogLevel;

  constructor(options: ConsoleLoggerOptions = {}) {
    this.minLevel = options.minLevel ?? "info";
  }

  trace(message: string, context?: Record<string, unknown>): void {
    this.write("trace", message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.write("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.write("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.write("warn", message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.write("error", message, context);
  }

  fatal(message: string, context?: Record<string, unknown>): void {
    this.write("fatal", message, context);
  }

  private write(
    level: CallableLogLevel,
    message: string,
    context?: Record<string, unknown>
  ): void {
    if (!isLevelEnabled(level, this.minLevel)) {
      return;
    }

    const consoleMethod = CONSOLE_METHOD_BY_LEVEL[level];

    if (context === undefined) {
      console[consoleMethod](message);
    } else {
      console[consoleMethod](message, context);
    }
  }
}
