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

export { defaultSleep, runRetryPolicy, runRetryPolicyResult } from "./base-policy.ts";
export { AbortError, RetryError } from "./errors.ts";
export type { AbortErrorContext, RetryErrorContext } from "./errors.ts";
export { exponentialBackoff } from "./exponential-backoff.ts";
export type { ExponentialBackoffOptions } from "./exponential-backoff.ts";
export { fixedDelay } from "./fixed-delay.ts";
export type { FixedDelayOptions } from "./fixed-delay.ts";
export { applyJitter } from "./jitter.ts";
export type { JitterMode, JitterOptions } from "./jitter.ts";
export { linearBackoff } from "./linear-backoff.ts";
export type { LinearBackoffOptions } from "./linear-backoff.ts";
export type {
  RetryDecision,
  RetryDecisionInput,
  RetryExhaustedInput,
  RetryPolicy,
  RetryRunOptions,
  RetryRunResult,
  RetryRunResultOptions,
} from "./types.ts";
