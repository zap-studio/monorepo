/**
 * Public entrypoint for the fetch package.
 *
 * Exposes:
 * - `$fetch` low-level typed fetch function
 * - `api` method shortcuts
 * - `createFetch` instance factory
 *
 * @module @zap-studio/fetch
 */

import { isStandardSchema } from '@zap-studio/validation';
import type { StandardSchemaV1 } from '@zap-studio/validation';

import { GLOBAL_DEFAULTS } from "./constants.js";
import { fetchInternal } from "./internal.js";
import { createMethod } from "./methods.js";
import type {
  $Fetch,
  ApiMethods,
  ExtendedRequestInit,
  FetchDefaults,
  FetchInput,
} from "./types.js";

/**
 * Type-safe fetch wrapper with Standard Schema validation.
 *
 * - When `throwOnValidationError: true`: validated data of type `TSchema`
 * - When `throwOnValidationError: false`: Standard Schema Result object `{ value?, issues? }`
 * - When `throwOnFetchError: true`: throws `FetchError` on non-ok responses
 *
 * If no schema is provided, returns the raw `Response` object.
 *
 * @throws {FetchError} When `throwOnFetchError` is `true` and the response is not ok.
 * @throws {ValidationError} When a schema is provided, validation returns issues, and
 *   `throwOnValidationError` is `true`.
 * @throws {TypeError} When both `body` and `json` are provided, when JSON request
 *   serialization fails, when request construction fails, when headers/search params are
 *   invalid, when `response.json()` cannot read the body, or when the runtime `fetch`
 *   implementation rejects network-level failures as `TypeError`.
 * @throws {DOMException} When the runtime rejects an aborted request or response body read
 *   as an `AbortError` DOMException.
 * @throws {SyntaxError} When a schema is provided and `response.json()` cannot parse the
 *   response body.
 * @throws Any error thrown or rejected by the provided Standard Schema validator.
 *
 * @example
 * import { z } from "zod";
 * import { $fetch } from "@zap-studio/fetch";
 *
 * const UserSchema = z.object({ id: z.number(), name: z.string() });
 *
 * // Basic usage (schema validation)
 * const user = await $fetch("/api/users/1", UserSchema, { headers: { "Authorization": "Bearer token" } });
 * console.log("Validated user:", user);
 *
 * // Raw usage (no schema validation and typed Response object)
 * const result = await $fetch("/api/data", { method: "POST", body: JSON.stringify({ key: "value" }) });
 * const json = await result.json() as ResultType;
 * console.log("Raw response data:", json);
 *
 * // Usage with validation errors returned instead of thrown
 * const result = await $fetch("/api/users/1", UserSchema, { throwOnValidationError: false });
 *
 * if (result.issues) {
 *   console.error("Validation errors:", result.issues);
 * } else {
 *   console.log("Validated user:", result.value);
 * }
 */
export async function $fetch<TSchema extends StandardSchemaV1>(
  input: FetchInput,
  schema: TSchema,
  options: ExtendedRequestInit & { throwOnValidationError: false }
): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;

export async function $fetch<TSchema extends StandardSchemaV1>(
  input: FetchInput,
  schema: TSchema,
  options?: ExtendedRequestInit & { throwOnValidationError?: true }
): Promise<StandardSchemaV1.InferOutput<TSchema>>;

export async function $fetch(
  input: FetchInput,
  options?: ExtendedRequestInit
): Promise<Response>;

export async function $fetch(
  input: FetchInput,
  schemaOrOptions?: StandardSchemaV1 | ExtendedRequestInit,
  optionsOrUndefined?: ExtendedRequestInit
): Promise<unknown> {
  const [schema, options] = isStandardSchema(schemaOrOptions)
    ? [schemaOrOptions, optionsOrUndefined]
    : [undefined, schemaOrOptions];

  return await fetchInternal(input, schema, options, GLOBAL_DEFAULTS);
}

/**
 * Convenience methods for common HTTP verbs.
 *
 * These methods always require a schema for validation.
 * For raw responses without validation, use `$fetch` directly.
 *
 * Each method has the same throw behavior as {@link $fetch}.
 *
 * @example
 * import { z } from "zod";
 * import { api } from "@zap-studio/fetch";
 *
 * const PostSchema = z.object({
 *   id: z.number(),
 *   title: z.string(),
 *   content: z.string(),
 * });
 *
 * async function fetchPost(postId: number) {
 *   const post = await api.get(`https://api.example.com/posts/${postId}`, PostSchema);
 *   return post; // post is typed as { id: number; title: string; content: string; }
 * }
 */
export const api: ApiMethods = {
  delete: createMethod($fetch, "DELETE"),
  get: createMethod($fetch, "GET"),
  patch: createMethod($fetch, "PATCH"),
  post: createMethod($fetch, "POST"),
  put: createMethod($fetch, "PUT"),
};

/**
 * Creates a custom fetch instance with pre-configured defaults.
 *
 * Use this factory to create API clients with a base URL, default headers,
 * and other shared configuration. Each instance is independent.
 *
 * The returned `$fetch` and `api` methods have the same throw behavior as the
 * top-level {@link $fetch} export.
 *
 * @example
 * import { z } from "zod";
 * import { createFetch } from "@zap-studio/fetch";
 *
 * // Create a configured instance
 * const { $fetch, api } = createFetch({
 *   baseURL: "https://api.example.com",
 *   headers: { "Authorization": "Bearer token" },
 * });
 *
 * const UserSchema = z.object({ id: z.number(), name: z.string() });
 *
 * // Now use relative paths - baseURL is prepended automatically
 * const user = await api.get("/users/1", UserSchema);
 *
 * // Or use $fetch directly
 * const response = await $fetch("/users", UserSchema, { method: "POST", json: { name: "John" } });
 */
export function createFetch(factoryOptions: Partial<FetchDefaults> = {}): {
  $fetch: $Fetch;
  api: ApiMethods;
} {
  const defaults: FetchDefaults = {
    ...GLOBAL_DEFAULTS,
    ...factoryOptions,
    baseURL: factoryOptions.baseURL ?? GLOBAL_DEFAULTS.baseURL,
    throwOnFetchError:
      factoryOptions.throwOnFetchError ?? GLOBAL_DEFAULTS.throwOnFetchError,
    throwOnValidationError:
      factoryOptions.throwOnValidationError ??
      GLOBAL_DEFAULTS.throwOnValidationError,
  };

  async function customFetch<TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    options: ExtendedRequestInit & { throwOnValidationError: false }
  ): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;

  async function customFetch<TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    options?: ExtendedRequestInit & {
      throwOnValidationError?: true;
    }
  ): Promise<StandardSchemaV1.InferOutput<TSchema>>;

  async function customFetch(
    input: FetchInput,
    options?: ExtendedRequestInit
  ): Promise<Response>;

  async function customFetch(
    input: FetchInput,
    schemaOrOptions?: StandardSchemaV1 | ExtendedRequestInit,
    optionsOrUndefined?: ExtendedRequestInit
  ): Promise<unknown> {
    const [schema, options] = isStandardSchema(schemaOrOptions)
      ? [schemaOrOptions, optionsOrUndefined]
      : [undefined, schemaOrOptions];

    return await fetchInternal(input, schema, options, defaults);
  }

  const customApi = {
    delete: createMethod(customFetch, "DELETE"),
    get: createMethod(customFetch, "GET"),
    patch: createMethod(customFetch, "PATCH"),
    post: createMethod(customFetch, "POST"),
    put: createMethod(customFetch, "PUT"),
  };

  return {
    $fetch: customFetch,
    api: customApi,
  };
}
