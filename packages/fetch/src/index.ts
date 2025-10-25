import type { z } from "zod";
import type { FetchConfig, ResponseType } from "./types";
import { FetchError } from "./errors";

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
export async function safeFetch<TResponse, TBody = unknown>(
	url: string,
	responseSchema: z.ZodType<TResponse>,
	config?: FetchConfig<TBody> & {
		throwOnValidationError?: true;
		responseType?: ResponseType;
	},
): Promise<TResponse>;

export async function safeFetch<TResponse, TBody = unknown>(
	url: string,
	responseSchema: z.ZodType<TResponse>,
	config?: FetchConfig<TBody> & {
		throwOnValidationError: false;
		responseType?: ResponseType;
	},
): Promise<ReturnType<typeof responseSchema.safeParse>>;

export async function safeFetch<TResponse, TBody = unknown>(
	url: string,
	responseSchema: z.ZodType<TResponse>,
	config?: FetchConfig<TBody> & { responseType?: ResponseType },
): Promise<TResponse | ReturnType<typeof responseSchema.safeParse>> {
	const {
		body,
		headers,
		throwOnValidationError = true,
		responseType = "json",
		...rest
	} = config || {};

	const fetchConfig: RequestInit = {
		...rest,
		headers: {
			...(headers as Record<string, string>),
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
			fetchConfig.body = body;
		} else if (typeof body === "string") {
			fetchConfig.body = body;
			if (shouldSetContentType) {
				(fetchConfig.headers as Record<string, string>)["Content-Type"] =
					"text/plain";
			}
		} else {
			fetchConfig.body = JSON.stringify(body);
			if (shouldSetContentType) {
				(fetchConfig.headers as Record<string, string>)["Content-Type"] =
					"application/json";
			}
		}
	}

	const response = await fetch(url, fetchConfig);

	if (!response.ok) {
		throw new FetchError(
			`HTTP ${response.status}: ${response.statusText}`,
			response.status,
			response.statusText,
			response,
		);
	}

	// Parse response based on responseType
	let data: unknown;

	if (responseType === "json") {
		const contentType = response.headers.get("content-type");
		if (contentType?.includes("application/json")) {
			data = await response.json();
		} else {
			throw new FetchError(
				"Expected JSON response but received different content type",
				response.status,
				response.statusText,
				response,
			);
		}
	} else if (responseType === "text") {
		data = await response.text();
	} else if (responseType === "blob") {
		data = await response.blob();
	} else if (responseType === "arrayBuffer") {
		data = await response.arrayBuffer();
	} else if (responseType === "formData") {
		data = await response.formData();
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
		url: string,
		schema: z.ZodType<TResponse>,
		config?: Omit<RequestInit, "method" | "body">,
	) => safeFetch(url, schema, { ...config, method: "GET" }),

	post: <TResponse, TBody = unknown>(
		url: string,
		schema: z.ZodType<TResponse>,
		body?: TBody,
		config?: Omit<RequestInit, "method" | "body">,
	) => safeFetch(url, schema, { ...config, method: "POST", body }),

	put: <TResponse, TBody = unknown>(
		url: string,
		schema: z.ZodType<TResponse>,
		body?: TBody,
		config?: Omit<RequestInit, "method" | "body">,
	) => safeFetch(url, schema, { ...config, method: "PUT", body }),

	patch: <TResponse, TBody = unknown>(
		url: string,
		schema: z.ZodType<TResponse>,
		body?: TBody,
		config?: Omit<RequestInit, "method" | "body">,
	) => safeFetch(url, schema, { ...config, method: "PATCH", body }),

	delete: <TResponse>(
		url: string,
		schema: z.ZodType<TResponse>,
		config?: Omit<RequestInit, "method" | "body">,
	) => safeFetch(url, schema, { ...config, method: "DELETE" }),
};
