// oxlint-disable max-classes-per-file -- Public retry error types are intentionally colocated.

/**
 * Terminal error types used by retry policies and runners.
 *
 * @module @zap-studio/retry/errors
 */

/**
 * Context payload attached to `RetryError`.
 *
 * @example
 * const context: RetryErrorContext = { attempts: 3, lastError: new Error("network") };
 */
export interface RetryErrorContext {
  /**
   * Count of completed attempts at exhaustion.
   */
  readonly attempts: number;
  /**
   * The last error object raised by a failed `execute` attempt.
   */
  readonly lastError?: unknown;
  /**
   * Optional data captured from the last attempt when provided by a policy.
   */
  readonly lastData?: unknown;
}

/**
 * Context payload attached to `AbortError`.
 *
 * @example
 * const context: AbortErrorContext = { cause: new Error("shutting down") };
 */
export interface AbortErrorContext {
  /**
   * When the abort `reason` was an `Error`, the optional wrapped cause.
   */
  readonly cause?: unknown;
}

/**
 * Error thrown when retries are exhausted.
 *
 * @example
 * throw new RetryError("Retry exhausted", {
 *   attempts: 3,
 *   lastError: new Error("network"),
 * });
 */
export class RetryError extends Error {
  /**
   * Total attempts performed before exhaustion.
   */
  public readonly attempts: number;
  /**
   * Last captured error from execution.
   */
  public readonly lastError?: unknown;
  /**
   * Last captured data value, when available.
   */
  public readonly lastData?: unknown;

  /**
   * Creates a RetryError with structured terminal context.
   */
  constructor(message: string, context: RetryErrorContext) {
    super(message);
    this.name = "RetryError";
    this.attempts = context.attempts;
    this.lastError = context.lastError;
    this.lastData = context.lastData;
  }
}

/**
 * Error thrown when retry orchestration is canceled through `AbortSignal`.
 *
 * @example
 * ```ts
 * import { AbortError, BaseRetryPolicy } from "@zap-studio/retry";
 *
 * const controller = new AbortController();
 * controller.abort("shutting down");
 *
 * try {
 *   await policy.run(doWork, { signal: controller.signal });
 * } catch (error) {
 *   if (error instanceof AbortError) {
 *     console.error("Retry canceled:", error.message);
 *   }
 * }
 * ```
 */
export class AbortError extends Error {
  /**
   * Optional wrapped cause when the native abort `reason` was an `Error`.
   */
  public override readonly cause?: unknown;

  /**
   * Creates an AbortError with an optional diagnostic cause.
   *
   * @param message - Human-readable abort description.
   * @param context - Optional `cause` link for diagnostic chaining.
   */
  constructor(message: string, context: AbortErrorContext = {}) {
    super(message);
    this.name = "AbortError";
    this.cause = context.cause;
  }
}
