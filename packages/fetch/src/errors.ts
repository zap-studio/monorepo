/**
 * Custom error types used by the fetch package.
 *
 * @module @zap-studio/fetch/errors
 */

/**
 * Error thrown for HTTP errors (non-2xx responses)
 *
 * Includes the failing `Response` object and status code for
 * downstream error handling and response inspection.
 *
 * @example
 * import { FetchError } from "@zap-studio/fetch/errors";
 *
 * try {
 *   await $fetch("/users/404");
 * } catch (error) {
 *   if (error instanceof FetchError) {
 *     console.error(error.status);
 *     console.error(await error.response.text());
 *   }
 * }
 */
export class FetchError extends Error {
  /**
   * HTTP status code from the failing response.
   */
  status: Response["status"];
  /**
   * Full response object for additional inspection.
   */
  response: Response;

  /**
   * Creates a FetchError from a non-ok response.
   */
  constructor(message: string, response: Response) {
    super(message);
    this.name = "FetchError";
    this.status = response.status;
    this.response = response;
  }
}
