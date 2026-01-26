/**
 * The logging level
 */
export type LogLevel = "info" | "warn" | "error";

/**
 * Logger interface
 */
export interface ILogger<
  TError = unknown,
  TContext extends Record<string, unknown> = Record<string, unknown>,
> {
  log(level: LogLevel, message: string, context?: Partial<TContext>): void;

  info: (message: string, context?: Partial<TContext>) => void | Promise<void>;
  warn: (message: string, context?: Partial<TContext>) => void | Promise<void>;

  error: (
    message: string,
    err?: TError,
    context?: Partial<TContext>
  ) => void | Promise<void>;
}
