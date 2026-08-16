/**
 * Jitter strategies applied to a computed backoff delay.
 *
 * @module @zap-studio/retry/jitter
 */

/**
 * Supported jitter strategies.
 *
 * - `"full"`: `random(0, delayMs)` — max spread, best thundering-herd
 *   protection.
 * - `"equal"`: `delayMs/2 + random(0, delayMs/2)` — keeps a floor at half
 *   the computed delay, less spread than full jitter.
 */
export type JitterMode = "equal" | "full";

/**
 * Configuration for jitter application.
 *
 * @example
 * const jitter: JitterOptions = { mode: "full" };
 */
export interface JitterOptions {
  /**
   * Jitter strategy to apply.
   */
  mode: JitterMode;
  /**
   * Random source in `[0, 1)`, overridable for deterministic tests.
   *
   * @default Math.random
   */
  random?: () => number;
}

/**
 * Applies a jitter strategy to a computed delay.
 *
 * @param delayMs - Delay in milliseconds before jitter.
 * @param jitter - Jitter mode shorthand, full `JitterOptions`, or `undefined`
 *   to leave `delayMs` untouched.
 * @returns Jittered delay in milliseconds, rounded to the nearest integer.
 *
 * @example
 * const delayMs = applyJitter(1000, "full"); // 0-1000
 */
export const applyJitter = (
  delayMs: number,
  jitter?: JitterMode | JitterOptions
): number => {
  if (jitter === undefined) {
    return delayMs;
  }

  const mode = typeof jitter === "string" ? jitter : jitter.mode;
  const random =
    (typeof jitter === "string" ? undefined : jitter.random) ?? Math.random;

  if (mode === "full") {
    return Math.round(random() * delayMs);
  }

  const half = delayMs / 2;
  return Math.round(half + random() * half);
};
