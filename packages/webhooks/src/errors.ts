/**
 * Error thrown when webhook request verification fails.
 *
 * This error is used by verifier helpers such as `createHmacVerifier` so
 * callers can distinguish verification failures from other webhook errors.
 */
export class VerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VerificationError";
  }
}
