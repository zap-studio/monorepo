import { randomBytes } from 'node:crypto';
import { Effect } from 'effect';

/**
 * Generates a secure authentication secret.
 *
 * This function generates a secure authentication secret using the `crypto` module.
 * It creates a random buffer of 32 bytes and converts it to a base64-encoded string.
 * The resulting string is then sliced to ensure it's a valid secret length.
 *
 * A base64-encoded secret string.
 *
 * @example
 * ```ts
 * const secret = generateAuthSecret();
 * console.log(secret); // Random base64 string
 * ```
 */
export function generateSecret(): string {
  return Effect.runSync(
    Effect.succeed(randomBytes(32).toString('base64').slice(0, 43))
  );
}
