import type { StandardSchemaV1 } from "@standard-schema/spec";
import { FetchError } from "./errors";
import type { RequestInitExtended, ResponseData, ResponseType } from "./types";
import { standardValidate } from "./validator";

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
 * // Basic usage
 * const user = await $fetch("/api/users/1", UserSchema);
 *
 * // Non-throwing usage
 * const result = await $fetch("/api/users/1", UserSchema, {
 *   throwOnFetchError: false,
 *   throwOnValidationError: false,
 * });
 *
 * if (result.issues) {
 *   console.error("Validation failed:", result.issues);
 * } else {
 *   console.log("Success:", result.value);
 * }
 */
export async function $fetch<TSchema extends StandardSchemaV1>(
  resource: string,
  responseSchema: TSchema,
  options?: RequestInitExtended
): Promise<
  | StandardSchemaV1.InferOutput<TSchema>
  | StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>
>;

export async function $fetch<
  TResponseType extends Exclude<ResponseType, "json">,
>(
  resource: string,
  responseSchema: StandardSchemaV1, // accepted but ignored for non-json
  options: RequestInitExtended & { responseType: TResponseType }
): Promise<ResponseData<TResponseType>>;

export async function $fetch<
  TSchema extends StandardSchemaV1,
  TResponseType extends ResponseType = "json",
>(
  resource: string,
  responseSchema: TSchema,
  options?: RequestInitExtended & { responseType?: TResponseType }
): Promise<
  | StandardSchemaV1.InferOutput<TSchema>
  | StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>
  | ResponseData<TResponseType>
> {
  const {
    throwOnValidationError = true,
    throwOnFetchError = true,
    responseType = "json" as TResponseType,
    ...rest
  } = options || {};

  const response = await fetch(resource, {
    ...rest,
  });

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
  const fn = method as (
    this: Response,
    ...args: []
  ) => ResponseData<TResponseType> | Promise<ResponseData<TResponseType>>;
  const raw = await Promise.resolve(fn.call(response));

  // For json, validate; for others, return raw
  if (responseType === "json") {
    return standardValidate(responseSchema, raw, throwOnValidationError);
  }

  return raw as ResponseData<TResponseType>;
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
