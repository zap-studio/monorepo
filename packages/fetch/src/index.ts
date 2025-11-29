import type { StandardSchemaV1 } from "@standard-schema/spec";
import { GLOBAL_DEFAULTS } from "./contants";
import type {
  CreateFetchOptions,
  FetchDefaults,
  RequestInitExtended,
} from "./types";
import { fetchInternal } from "./utils";
import { isStandardSchema } from "./validator";

/**
 * Type-safe fetch wrapper with Standard Schema validation.
 *
 * - When `throwOnValidationError: true`: validated data of type `TSchema`
 * - When `throwOnValidationError: false`: Standard Schema Result object `{ value?, issues? }`
 * - When `throwOnFetchError: true`: throws `FetchError` on non-ok responses
 *
 * If no schema is provided, returns the raw `Response` object.
 *
 * @throws {FetchError} When `throwOnFetchError: true` and response is not ok
 * @throws {ValidationError} When `throwOnValidationError: true` and validation fails
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
  resource: string,
  schema: TSchema,
  options?: RequestInitExtended
): Promise<
  | StandardSchemaV1.InferOutput<TSchema>
  | StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>
>;

export async function $fetch(
  resource: string,
  options?: RequestInitExtended
): Promise<Response>;

export async function $fetch(
  resource: string,
  schemaOrOptions?: StandardSchemaV1 | RequestInitExtended,
  optionsOrUndefined?: RequestInitExtended
): Promise<unknown> {
  const [schema, options] = isStandardSchema(schemaOrOptions)
    ? [schemaOrOptions, optionsOrUndefined]
    : [undefined, schemaOrOptions];

  return await fetchInternal(resource, schema, options, GLOBAL_DEFAULTS);
}

/**
 * Convenience methods for common HTTP verbs.
 *
 * These methods always require a schema for validation.
 * For raw responses without validation, use `$fetch` directly.
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
export const api = {
  get: <TSchema extends StandardSchemaV1>(
    resource: string,
    schema: TSchema,
    options?: Omit<RequestInitExtended, "method">
  ) => $fetch(resource, schema, { ...options, method: "GET" }),

  post: <TSchema extends StandardSchemaV1>(
    resource: string,
    schema: TSchema,
    options?: Omit<RequestInitExtended, "method">
  ) => $fetch(resource, schema, { ...options, method: "POST" }),

  put: <TSchema extends StandardSchemaV1>(
    resource: string,
    schema: TSchema,
    options?: Omit<RequestInitExtended, "method">
  ) => $fetch(resource, schema, { ...options, method: "PUT" }),

  patch: <TSchema extends StandardSchemaV1>(
    resource: string,
    schema: TSchema,
    options?: Omit<RequestInitExtended, "method">
  ) => $fetch(resource, schema, { ...options, method: "PATCH" }),

  delete: <TSchema extends StandardSchemaV1>(
    resource: string,
    schema: TSchema,
    options?: Omit<RequestInitExtended, "method">
  ) => $fetch(resource, schema, { ...options, method: "DELETE" }),
};

/**
 * Creates a custom fetch instance with pre-configured defaults.
 *
 * Use this factory to create API clients with a base URL, default headers,
 * and other shared configuration. Each instance is independent.
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
 * const response = await $fetch("/users", UserSchema, { method: "POST", body: { name: "John" } });
 */
export function createFetch(factoryOptions: CreateFetchOptions = {}): {
  $fetch: typeof $fetch;
  api: typeof api;
} {
  const defaults: FetchDefaults = {
    baseURL: factoryOptions.baseURL ?? "",
    headers: factoryOptions.headers,
    throwOnFetchError: factoryOptions.throwOnFetchError ?? true,
    throwOnValidationError: factoryOptions.throwOnValidationError ?? true,
  };

  async function customFetch<TSchema extends StandardSchemaV1>(
    resource: string,
    schema: TSchema,
    options?: RequestInitExtended
  ): Promise<
    | StandardSchemaV1.InferOutput<TSchema>
    | StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>
  >;

  async function customFetch(
    resource: string,
    options?: RequestInitExtended
  ): Promise<Response>;

  async function customFetch(
    resource: string,
    schemaOrOptions?: StandardSchemaV1 | RequestInitExtended,
    optionsOrUndefined?: RequestInitExtended
  ): Promise<unknown> {
    const [schema, options] = isStandardSchema(schemaOrOptions)
      ? [schemaOrOptions, optionsOrUndefined]
      : [undefined, schemaOrOptions];

    return await fetchInternal(resource, schema, options, defaults);
  }

  const customApi = {
    get: <TSchema extends StandardSchemaV1>(
      resource: string,
      schema: TSchema,
      options?: Omit<RequestInitExtended, "method">
    ) => customFetch(resource, schema, { ...options, method: "GET" }),

    post: <TSchema extends StandardSchemaV1>(
      resource: string,
      schema: TSchema,
      options?: Omit<RequestInitExtended, "method">
    ) => customFetch(resource, schema, { ...options, method: "POST" }),

    put: <TSchema extends StandardSchemaV1>(
      resource: string,
      schema: TSchema,
      options?: Omit<RequestInitExtended, "method">
    ) => customFetch(resource, schema, { ...options, method: "PUT" }),

    patch: <TSchema extends StandardSchemaV1>(
      resource: string,
      schema: TSchema,
      options?: Omit<RequestInitExtended, "method">
    ) => customFetch(resource, schema, { ...options, method: "PATCH" }),

    delete: <TSchema extends StandardSchemaV1>(
      resource: string,
      schema: TSchema,
      options?: Omit<RequestInitExtended, "method">
    ) => customFetch(resource, schema, { ...options, method: "DELETE" }),
  };

  return {
    $fetch: customFetch,
    api: customApi,
  };
}
