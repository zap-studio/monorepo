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
export type LogLevel = "all" | "trace" | "debug" | "info" | "warn" | "error" | "fatal" | "none";

/**
 * `LogLevel` values that correspond to a callable `Logger` method, i.e.
 * every level except the `"all"`/`"none"` filtering boundaries.
 */
export type CallableLogLevel = Exclude<LogLevel, "all" | "none">;

/**
 * A single log call's data, built right before it's written (below-threshold
 * calls never reach a formatter).
 */
export interface LogRecord {
  /**
   * The level the message was logged at.
   */
  readonly level: CallableLogLevel;
  /**
   * The log message.
   */
  readonly message: string;
  /**
   * Optional structured data passed alongside the message.
   */
  readonly context: Record<string, unknown> | undefined;
  /**
   * When the log call was made.
   */
  readonly timestamp: Date;
}

/**
 * Turns a {@link LogRecord} into the argument list passed to
 * `console[method](...args)`. Any function matching this shape works — no
 * base class or registration required.
 *
 * @example
 * const upperFormat: LogFormatter = (record) => [record.message.toUpperCase()];
 */
export type LogFormatter = (record: LogRecord) => unknown[];

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
