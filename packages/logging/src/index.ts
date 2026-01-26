/**
 * The logging level
 */
export type LogLevel = "info" | "warn" | "error";

/**
 * Runtime configuration for loggers.
 */
export interface LoggerOptions {
  /**
   * Prepend an ISO timestamp to each message.
   */
  timestamp?: boolean;
}

/**
 * Logger interface
 */
export interface ILogger<
  TError = unknown,
  TContext extends Record<string, unknown> = Record<string, unknown>,
> {
  log(
    level: LogLevel,
    message: string,
    context?: Partial<TContext>
  ): void | Promise<void>;

  info: (message: string, context?: Partial<TContext>) => void | Promise<void>;
  warn: (message: string, context?: Partial<TContext>) => void | Promise<void>;

  error: (
    message: string,
    err?: TError,
    context?: Partial<TContext>
  ) => void | Promise<void>;
}

/**
 * Base logger with shared formatting and convenience methods.
 */
export abstract class AbstractLogger<
  TError = unknown,
  TContext extends Record<string, unknown> = Record<string, unknown>,
> implements ILogger<TError, TContext>
{
  protected readonly options: LoggerOptions;

  constructor(options: LoggerOptions = {}) {
    this.options = options;
  }

  log(level: LogLevel, message: string, context?: Partial<TContext>): void {
    this.write(level, this.formatMessage(level, message), context);
  }

  info(message: string, context?: Partial<TContext>): void | Promise<void> {
    this.log("info", message, context);
  }

  warn(message: string, context?: Partial<TContext>): void | Promise<void> {
    this.log("warn", message, context);
  }

  error(
    message: string,
    err?: TError,
    context?: Partial<TContext>
  ): void | Promise<void> {
    this.write("error", this.formatMessage("error", message), context, err);
  }

  /**
   * Low-level output hook that concrete loggers must implement.
   */
  protected abstract write(
    level: LogLevel,
    message: string,
    context?: Partial<TContext>,
    err?: TError
  ): void;

  /**
   * Normalizes the log message with level and timestamp.
   */
  protected formatMessage(level: LogLevel, message: string): string {
    const levelLabel = level.toUpperCase();
    const timestamp = this.options.timestamp
      ? `${new Date().toISOString()} `
      : "";

    return `[${levelLabel}] ${timestamp}${message}`;
  }
}
