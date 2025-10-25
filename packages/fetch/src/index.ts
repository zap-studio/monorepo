import type { z } from "zod";
import { FetchError } from "./errors";
import type { FetchConfig, ResponseType, ResponseTypeMap } from "./types";

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
	},
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

	const options: RequestInit = {
		...rest,
		headers: {
			...headers,
		},
	};

	// Only set Content-Type if body exists and it's not FormData
	if (body !== undefined) {
		const shouldSetContentType =
			!headers ||
			(typeof headers === "object" &&
				!Array.isArray(headers) &&
				!(headers instanceof Headers) &&
				!("Content-Type" in headers));

		if (body instanceof FormData) {
			options.body = body;
		} else if (typeof body === "string") {
			options.body = body;
			if (shouldSetContentType) {
				(options.headers as Record<string, string>)["Content-Type"] =
					"text/plain";
			}
		} else {
			options.body = JSON.stringify(body);
			if (shouldSetContentType) {
				(options.headers as Record<string, string>)["Content-Type"] =
					"application/json";
			}
		}
	}

	const response = await fetch(resource, options);

	if (!response.ok) {
		throw new FetchError(
			`HTTP ${response.status}: ${response.statusText}`,
			response.status,
			response.statusText,
			response,
		);
	}

	// Parse response based on responseType
	let data: ResponseTypeMap[TResponseType];

	const contentType = response.headers.get("content-type");
	if (responseType === "json") {
		if (!contentType?.includes("application/json")) {
			throw new FetchError(
				"Expected JSON response but received no content type",
				response.status,
				response.statusText,
				response,
			);
		}
		data = (await response.json()) as ResponseTypeMap[TResponseType];
	} else if (responseType === "arrayBuffer") {
		data = (await response.arrayBuffer()) as ResponseTypeMap[TResponseType];
	} else if (responseType === "blob") {
		data = (await response.blob()) as ResponseTypeMap[TResponseType];
	} else if (responseType === "bytes") {
		const buffer = await response.arrayBuffer();
		data = new Uint8Array(buffer) as ResponseTypeMap[TResponseType];
	} else if (responseType === "clone") {
		data = response.clone() as ResponseTypeMap[TResponseType];
	} else if (responseType === "formData") {
		if (contentType?.includes("multipart/form-data") === false) {
			throw new FetchError(
				"Expected FormData response but received different content type",
				response.status,
				response.statusText,
				response,
			);
		}
		data = (await response.formData()) as ResponseTypeMap[TResponseType];
	} else if (responseType === "text") {
		if (contentType?.includes("text/") === false) {
			throw new FetchError(
				"Expected text response but received different content type",
				response.status,
				response.statusText,
				response,
			);
		}
		data = (await response.text()) as ResponseTypeMap[TResponseType];
	} else {
		throw new FetchError(
			`Unsupported response type: ${responseType}`,
			response.status,
			response.statusText,
			response,
		);
	}

	if (throwOnValidationError) {
		return responseSchema.parse(data);
	}

	return responseSchema.safeParse(data);
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
		options?: Omit<RequestInit, "method" | "body">,
	) => safeFetch(resource, schema, { ...options, method: "GET" }),

	post: <TResponse, TBody = unknown>(
		resource: string,
		schema: z.ZodType<TResponse>,
		body?: TBody,
		options?: Omit<RequestInit, "method" | "body">,
	) => safeFetch(resource, schema, { ...options, method: "POST", body }),

	put: <TResponse, TBody = unknown>(
		resource: string,
		schema: z.ZodType<TResponse>,
		body?: TBody,
		options?: Omit<RequestInit, "method" | "body">,
	) => safeFetch(resource, schema, { ...options, method: "PUT", body }),

	patch: <TResponse, TBody = unknown>(
		resource: string,
		schema: z.ZodType<TResponse>,
		body?: TBody,
		options?: Omit<RequestInit, "method" | "body">,
	) => safeFetch(resource, schema, { ...options, method: "PATCH", body }),

	delete: <TResponse>(
		resource: string,
		schema: z.ZodType<TResponse>,
		options?: Omit<RequestInit, "method" | "body">,
	) => safeFetch(resource, schema, { ...options, method: "DELETE" }),
};
