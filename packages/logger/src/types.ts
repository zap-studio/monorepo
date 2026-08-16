/**
 * Public type contracts for the logger abstraction.
 *
 * @module @zap-studio/logger/types
 */

/**
 * Verbosity level for a log entry, or a filtering boundary for
 * `ConsoleLoggerOptions.minLevel`.
 *
 * Only `"trace"`, `"debug"`, `"info"`, `"warn"`, `"error"`, and `"fatal"`
 * correspond to callable `Logger` methods. `"all"` and `"none"` are valid
 * only as a `minLevel` boundary: `"all"` logs everything, `"none"` silences
 * everything.
 *
 * Ordered `"all" < "trace" < "debug" < "info" < "warn" < "error" < "fatal" <
 * "none"`.
 */
export type LogLevel =
  | "all"
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal"
  | "none";

/**
 * Logger contract consumed by `@zap-studio/*` packages that accept an
 * optional `logger` option.
 *
 * Any object implementing this interface works — no base class or
 * subclassing required.
 *
 * @example
 * const logger: Logger = {
 *   trace: (message, context) => console.debug(message, context),
 *   debug: (message, context) => console.debug(message, context),
 *   info: (message, context) => console.info(message, context),
 *   warn: (message, context) => console.warn(message, context),
 *   error: (message, context) => console.error(message, context),
 *   fatal: (message, context) => console.error(message, context),
 * };
 */
export interface Logger {
  /**
   * Logs a trace-level message, the most verbose level.
   */
  trace: (message: string, context?: Record<string, unknown>) => void;
  /**
   * Logs a debug-level message.
   */
  debug: (message: string, context?: Record<string, unknown>) => void;
  /**
   * Logs an info-level message.
   */
  info: (message: string, context?: Record<string, unknown>) => void;
  /**
   * Logs a warn-level message.
   */
  warn: (message: string, context?: Record<string, unknown>) => void;
  /**
   * Logs an error-level message.
   */
  error: (message: string, context?: Record<string, unknown>) => void;
  /**
   * Logs a fatal-level message, the least verbose level.
   */
  fatal: (message: string, context?: Record<string, unknown>) => void;
}
