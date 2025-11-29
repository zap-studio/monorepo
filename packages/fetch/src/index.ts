import type { StandardSchemaV1 } from "@standard-schema/spec";
import { FetchError } from "./errors";
import type { RequestInitExtended } from "./types";
import { isStandardSchema, standardValidate } from "./validator";

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
    ...rest
  } = options || {};

  const init = { ...rest } as RequestInit;

  // Auto-stringify body and set Content-Type if we have a schema
  if (schema && init.body) {
    init.body = JSON.stringify(init.body);
    init.headers = {
      ...(init.headers || {}),
      "Content-Type": "application/json",
    };
  }

  const response = await fetch(resource, init);

  if (throwOnFetchError && !response.ok) {
    throw new FetchError(
      `HTTP ${response.status}: ${response.statusText}`,
      response
    );
  }

  // For json with schema, validate
  if (schema) {
    const raw = await response.json();
    return standardValidate(schema, raw, throwOnValidationError);
  }

  // No validation, return raw response data
  return response;
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
