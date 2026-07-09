/**
 * Method helper factories used to build verb-specific fetch functions.
 *
 * @module @zap-studio/fetch/methods
 */

import { isStandardSchema } from "@zap-studio/validation";
import type { StandardSchemaV1 } from "@zap-studio/validation";

import type { $Fetch, ExtendedRequestInit, FetchInput } from "./types.js";

/**
 * Creates an HTTP method helper bound to a fetch function.
 *
 * The returned function mirrors `$Fetch` overloads but forces the provided
 * HTTP method (`GET`, `POST`, etc.) into request options.
 *
 * @param fetchFn - Fetch function to wrap.
 * @param method - HTTP method to enforce.
 * @returns Method-bound fetch function.
 * @throws {unknown} Any error thrown or rejected by `fetchFn` when the returned method-bound
 *   fetch function is called.
 *
 * @example
 * const get = createMethod($fetch, "GET");
 * const user = await get("/users/1", UserSchema);
 */
export const createMethod = (fetchFn: $Fetch, method: string): $Fetch => {
  function methodFetch<TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    options: ExtendedRequestInit & {
      throwOnValidationError: false;
    }
  ): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;

  function methodFetch<TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    options?: ExtendedRequestInit & {
      throwOnValidationError?: true;
    }
  ): Promise<StandardSchemaV1.InferOutput<TSchema>>;

  function methodFetch(
    input: FetchInput,
    options?: ExtendedRequestInit
  ): Promise<Response>;

  /**
   * Method-bound `$Fetch` implementation.
   *
   * Resolves schema/option overloads and injects the configured HTTP method.
   */
  async function methodFetch(
    input: FetchInput,
    schemaOrOptions?: StandardSchemaV1 | ExtendedRequestInit,
    optionsOrUndefined?: ExtendedRequestInit
  ): Promise<unknown> {
    if (isStandardSchema(schemaOrOptions)) {
      if (optionsOrUndefined?.throwOnValidationError === false) {
        return await fetchFn(input, schemaOrOptions, {
          ...optionsOrUndefined,
          method,
          throwOnValidationError: false,
        });
      }

      const { throwOnValidationError, ...restOptions } =
        optionsOrUndefined ?? {};

      if (throwOnValidationError === true) {
        return await fetchFn(input, schemaOrOptions, {
          ...restOptions,
          method,
          throwOnValidationError: true,
        });
      }

      return await fetchFn(input, schemaOrOptions, {
        ...restOptions,
        method,
      });
    }

    return await fetchFn(input, {
      ...schemaOrOptions,
      method,
    });
  }

  return methodFetch;
};
