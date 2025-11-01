import type { z } from "zod";
import { FetchError } from "./errors";
import type { FetchConfig, ResponseType } from "./types";
import { parseResponse, prepareHeadersAndBody } from "./utils";

/**
 * Type-safe fetch wrapper with Zod validation
 *
 * @example
 * import { z } from "zod";
 * import { safeFetch } from "@zap-studio/fetch";
 *
 * const UserSchema = z.object({
 *   id: z.number(),
 *   name: z.string(),
 *   email: z.string().email(),
 * });
 *
 * async function getUser(userId: number) {
 *   const user = await safeFetch(
 *     `https://api.example.com/users/${userId}`,
 *     UserSchema,
 *     { method: "GET" }
 *   );
 *   return user; // user is typed as { id: number; name: string; email: string; }
 * }
 */
export async function safeFetch<
  TResponse,
  TBody = unknown,
  TResponseType extends ResponseType = "json",
>(
  resource: string,
  responseSchema: z.ZodType<TResponse>,
  config?: FetchConfig<TBody> & {
    throwOnValidationError?: boolean;
    responseType?: TResponseType;
  }
): Promise<
  TResponse | z.ZodSafeParseSuccess<TResponse> | z.ZodSafeParseError<TResponse>
> {
  const {
    body,
    headers,
    throwOnValidationError = true,
    responseType = "json" as TResponseType,
    ...rest
  } = config || {};

  const { body: preparedBody, headers: preparedHeaders } =
    prepareHeadersAndBody(body, headers);

  const response = await fetch(resource, {
    ...rest,
    body: preparedBody,
    headers: preparedHeaders,
  });

  if (!response.ok) {
    throw new FetchError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      response.statusText,
      response
    );
  }

  const data = await parseResponse(response, responseType);

  return throwOnValidationError
    ? responseSchema.parse(data)
    : responseSchema.safeParse(data);
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
  get: <TResponse>(
    resource: string,
    schema: z.ZodType<TResponse>,
    options?: Omit<RequestInit, "method" | "body">
  ) => safeFetch(resource, schema, { ...options, method: "GET" }),

  post: <TResponse, TBody = unknown>(
    resource: string,
    schema: z.ZodType<TResponse>,
    body?: TBody,
    options?: Omit<RequestInit, "method" | "body">
  ) => safeFetch(resource, schema, { ...options, method: "POST", body }),

  put: <TResponse, TBody = unknown>(
    resource: string,
    schema: z.ZodType<TResponse>,
    body?: TBody,
    options?: Omit<RequestInit, "method" | "body">
  ) => safeFetch(resource, schema, { ...options, method: "PUT", body }),

  patch: <TResponse, TBody = unknown>(
    resource: string,
    schema: z.ZodType<TResponse>,
    body?: TBody,
    options?: Omit<RequestInit, "method" | "body">
  ) => safeFetch(resource, schema, { ...options, method: "PATCH", body }),

  delete: <TResponse>(
    resource: string,
    schema: z.ZodType<TResponse>,
    options?: Omit<RequestInit, "method" | "body">
  ) => safeFetch(resource, schema, { ...options, method: "DELETE" }),
};
