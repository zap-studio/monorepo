/**
 * Error primitives for policy evaluation and configuration failures.
 *
 * @module @zap-studio/permit/errors
 */

/**
 * Represents an error that occurs during policy evaluation or enforcement.
 * Use this error to indicate issues related to policy logic, configuration, or execution.
 *
 * @example
 * ```ts
 * import { PolicyError } from "@zap-studio/permit";
 *
 * try {
 *   const policy = createPolicy(config);
 *   await policy.can(ctx, "post:read", post);
 * } catch (error) {
 *   if (error instanceof PolicyError) {
 *     console.error("Invalid policy configuration:", error.message);
 *   }
 * }
 * ```
 */
export class PolicyError extends Error {
  /**
   * Creates a policy error with a human-readable message.
   *
   * @param message - Error message describing the policy failure.
   */
  constructor(message: string) {
    super(message);
    this.name = "PolicyError";
  }
}
