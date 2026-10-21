/**
 * Error primitives for webhook verification failures.
 *
 * @module @zap-studio/webhooks/errors
 */

/**
 * Error thrown when webhook request verification fails.
 *
 * This error is used by verifier helpers such as `createHmacVerifier` so
 * callers can distinguish verification failures from other webhook errors.
 *
 * @example
 * ```ts
 * import { VerificationError } from "@zap-studio/webhooks";
 *
 * const response = await router.handle(request);
 * // Verification failures surface as a 500 response by default, or via onError:
 * const routerWithHandler = createWebhookRouter({
 *   verify: createHmacVerifier({ headerName: "x-signature", secret }),
 *   onError: (error) => {
 *     if (error instanceof VerificationError) {
 *       return Response.json({ error: error.message }, { status: 401 });
 *     }
 *   },
 * });
 * ```
 */
export class VerificationError extends Error {
  /**
   * Creates a verification error with a human-readable message.
   *
   * @param message - Error message describing the verification failure.
   */
  constructor(message: string) {
    super(message);
    this.name = "VerificationError";
  }
}
