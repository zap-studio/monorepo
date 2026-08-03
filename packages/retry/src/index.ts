/**
 * Public entrypoint for the retry package.
 *
 * Re-exports the full public API. Every symbol is also available from a
 * dedicated subpath (`@zap-studio/retry/base-policy`,
 * `@zap-studio/retry/exponential-backoff`, ...) for consumers who prefer
 * granular imports. All exports are side-effect free and tree-shakeable.
 *
 * @module @zap-studio/retry
 */

export { sleepWithAbortSignal, throwIfAborted, toAbortError } from "./abort.js";
export { BaseRetryPolicy } from "./base-policy.js";
export { AbortError, RetryError } from "./errors.js";
export type { AbortErrorContext, RetryErrorContext } from "./errors.js";
export { ExponentialBackoff } from "./exponential-backoff.js";
export type { ExponentialBackoffOptions } from "./exponential-backoff.js";
export { FixedDelay } from "./fixed-delay.js";
export type { FixedDelayOptions } from "./fixed-delay.js";
export { defaultSleep } from "./sleep.js";
export type {
  RetryDecision,
  RetryDecisionInput,
  RetryExhaustedInput,
  RetryPolicy,
  RetryRunOptions,
  RetryRunResult,
} from "./types.js";
