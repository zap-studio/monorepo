/**
 * Error primitives for env schema composition, validation, and access
 * failures.
 *
 * @module @zap-studio/env/errors
 */

import type { StandardSchemaV1 } from "@zap-studio/validation";

/**
 * Error thrown when `createEnv` is misconfigured: a key declared by more
 * than one composed `extends` source with two different schemas, or a
 * `client` key that does not start with the configured `clientPrefix`.
 *
 * @example
 * ```ts
 * import { EnvError } from "@zap-studio/env/errors";
 *
 * try {
 *   createEnv({ extends: [base, override], runtimeEnv: process.env });
 * } catch (error) {
 *   if (error instanceof EnvError) {
 *     console.error(error.message);
 *   }
 * }
 * ```
 *
 * @public
 */
export class EnvError extends Error {
  /**
   * Creates an env configuration error with a human-readable message.
   *
   * @param message - Error message describing the configuration failure.
   */
  constructor(message: string) {
    super(message);
    this.name = "EnvError";
  }
}

/**
 * Error thrown when one or more env vars fail Standard Schema validation.
 *
 * The error contains the list of invalid keys (never their values, so the
 * message is safe to log) and the full Standard Schema issues per key for
 * programmatic inspection.
 *
 * Thrown by `createEnv` when validation fails and no `onValidationError`
 * callback is provided.
 *
 * @example
 * ```ts
 * try {
 *   const env = createEnv({ server: { PORT: z.coerce.number() }, runtimeEnv: process.env });
 * } catch (error) {
 *   if (error instanceof EnvValidationError) {
 *     console.error("Invalid env vars:", error.invalidKeys);
 *   }
 * }
 * ```
 *
 * @public
 */
export class EnvValidationError extends Error {
  /**
   * The keys that failed validation. Never includes the offending values.
   */
  invalidKeys: readonly string[];

  /**
   * The Standard Schema issues per invalid key.
   */
  issues: Readonly<Record<string, readonly StandardSchemaV1.Issue[]>>;

  /**
   * Creates a new `EnvValidationError`.
   *
   * @param issues - The validation issues per key, as returned by the Standard Schema.
   */
  constructor(issues: Readonly<Record<string, readonly StandardSchemaV1.Issue[]>>) {
    const invalidKeys = Object.keys(issues).sort();
    super(`Invalid environment variables: ${invalidKeys.join(", ")}`);
    this.name = "EnvValidationError";
    this.invalidKeys = invalidKeys;
    this.issues = issues;
  }
}

/**
 * Error thrown when client-side code accesses a server-only env var.
 *
 * Thrown by the object `createEnv` returns when `isServer` is `false` and
 * no `onInvalidAccess` callback is provided.
 *
 * @example
 * ```ts
 * try {
 *   env.DATABASE_URL; // server-only key, accessed from the browser
 * } catch (error) {
 *   if (error instanceof EnvAccessError) {
 *     console.error(error.message);
 *   }
 * }
 * ```
 *
 * @public
 */
export class EnvAccessError extends Error {
  /**
   * The key that was accessed from client-side code.
   */
  key: string;

  /**
   * Creates a new `EnvAccessError`.
   *
   * @param key - The server-only key that was accessed.
   */
  constructor(key: string) {
    super(
      `Attempted to access server-side environment variable "${key}" on the client. This is a server-only variable and is not exposed to the client bundle.`,
    );
    this.name = "EnvAccessError";
    this.key = key;
  }
}
