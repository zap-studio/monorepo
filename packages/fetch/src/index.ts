import type { StandardSchemaV1 } from "@standard-schema/spec";
import { FetchError } from "./errors";
import type { RequestInitExtended, ResponseData, ResponseType } from "./types";
import { isPlainObject } from "./utils";
import { isStandardSchema, standardValidate } from "./validator";

/**
 * Type-safe fetch wrapper with Standard Schema validation.
 *
 * - When `throwOnValidationError: true`: validated data of type `TSchema`
 * - When `throwOnValidationError: false`: Standard Schema Result object `{ value?, issues? }`
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
 * // Basic usage (JSON with validation)
 * const user = await $fetch("/api/users/1", UserSchema);
 *
 * // Raw usage (no schema)
 * const blob = await $fetch("/api/image", { responseType: "blob" });
 *
 * // Raw usage with manual type (no runtime validation)
 * const data = await $fetch<MyType>("/api/data");
 *
 * // Usage with validation errors returned instead of thrown
 * const result = await $fetch("/api/users/1", UserSchema, { throwOnValidationError: false });
 *
 * if (result.issues) {
 *   console.error("Validation errors:", result.issues);
 * } else {
 *   console.log("Validated user:", result.value);
 * }
 *
 * // Usage with custom fetch options and fetch error throwing
 * const user = await $fetch("/api/users/1", UserSchema, {
 *   method: "GET",
 *   headers: { "Authorization": "Bearer token" },
 *   throwOnFetchError: true,
 * });
 */
export async function $fetch<TSchema extends StandardSchemaV1>(
  resource: string,
  schema: TSchema,
  options?: RequestInitExtended
): Promise<
  | StandardSchemaV1.InferOutput<TSchema>
  | StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>
>;

export async function $fetch<TResponseType extends ResponseType = "json">(
  resource: string,
  options?: RequestInitExtended
): Promise<ResponseData<TResponseType>>;

export async function $fetch<T>(
  resource: string,
  options?: RequestInitExtended
): Promise<T>;

export async function $fetch(
  resource: string,
  schemaOrOptions?: StandardSchemaV1 | RequestInitExtended,
  optionsOrUndefined?: RequestInitExtended
): Promise<unknown> {
  let schema: StandardSchemaV1 | undefined;
  let options: RequestInitExtended | undefined;

  if (isStandardSchema(schemaOrOptions)) {
    schema = schemaOrOptions;
    options = optionsOrUndefined;
  } else {
    schema = undefined;
    options = schemaOrOptions as RequestInitExtended;
  }

  const {
    throwOnValidationError = true,
    throwOnFetchError = true,
    responseType = "json",
    ...rest
  } = options || {};

  const init = { ...rest } as RequestInit;

  // Auto-stringify body and set Content-Type if it's a plain object/array
  if (
    options?.body &&
    (isPlainObject(options.body) || Array.isArray(options.body))
  ) {
    init.body = JSON.stringify(options.body);
    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    init.headers = headers;
  }

  const response = await fetch(resource, init);

  if (throwOnFetchError && !response.ok) {
    throw new FetchError(
      `HTTP ${response.status}: ${response.statusText}`,
      response
    );
  }

  const method = response[responseType];
  if (typeof method !== "function") {
    throw new FetchError(
      `Unsupported response type: ${String(responseType)}`,
      response
    );
  }

  // Invoke the corresponding Response method (e.g., json, text, blob, ...)
  const fn = method as (this: Response, ...args: []) => Promise<unknown>;
  const raw = await Promise.resolve(fn.call(response));

  // For json with schema, validate
  if (responseType === "json" && schema) {
    return standardValidate(schema, raw, throwOnValidationError);
  }

  // No validation, return raw response data
  return raw;
}

/**
 * Convenience methods for common HTTP verbs
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
 *  const post = await api.get(`https://api.example.com/posts/${postId}`, PostSchema);
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
