/** HTTP methods */
export type HTTPMethod =
	| "GET"
	| "HEAD"
	| "POST"
	| "PUT"
	| "DELETE"
	| "CONNECT"
	| "OPTIONS"
	| "TRACE"
	| "PATCH";

/** This is the normalized request object so every adapter can rely on the same structure */
export interface NormalizedRequest {
	/** The HTTP method of the request */
	method: HTTPMethod;
	/** The path of the request (e.g. "/payment") */
	path: string;
	/** The headers of the request (e.g. { "Authorization": "Bearer token" }) */
	headers: Headers;
	/** The raw body of the request (for signature) */
	rawBody: Buffer;
	/** The parsed JSON body of the request if applicable */
	json?: unknown;
	/** The parsed text body of the request if applicable */
	text?: string;
	/** The query parameters of the request */
	query?: Record<string, string | string[]>;
	/** The route parameters of the request */
	params?: Record<string, string>;
}

/** This is the normalized response object so every adapter can rely on the same structure */
export interface NormalizedResponse {
	/** The HTTP status code of the response */
	status: number;
	/** The body of the response */
	body?: unknown;
	/** The headers of the response */
	headers?: Headers;
}

/**
 * Validation result for schema validation
 */
export interface ValidationResult<T> {
	/** Whether validation succeeded */
	success: boolean;
	/** The validated data if successful */
	data?: T;
	/** Validation errors if failed */
	errors?: Array<{
		path?: string[];
		message: string;
	}>;
}

/**
 * Generic schema validator interface that can be implemented by any validation library
 */
export interface SchemaValidator<T> {
	/**
	 * Validate data against the schema
	 * @param data - The data to validate
	 * @returns Validation result with success flag, data, and potential errors
	 */
	validate(data: unknown): ValidationResult<T> | Promise<ValidationResult<T>>;
}

/** Options for registering a webhook handler */
export interface RegisterOptions<T> {
	/** The handler function to process the webhook */
	handler: WebhookHandler<T>;
	/** Optional schema validator to validate the webhook payload */
	schema?: SchemaValidator<T>;
}

/** The webhook handler function, responsible for processing incoming webhook events. */
export type WebhookHandler<T = unknown> = (ctx: {
	req: NormalizedRequest;
	payload: T;
	ack: (res?: Partial<NormalizedResponse>) => Promise<NormalizedResponse>;
}) => Promise<NormalizedResponse | undefined> | NormalizedResponse | undefined;

/** A map of webhook event types to their corresponding handler functions. */
// biome-ignore lint/suspicious/noExplicitAny: We want to allow any type here for flexibility
export type HandlerMap<TMap extends Record<string, any>> = {
	[P in keyof TMap]: WebhookHandler<TMap[P]>;
};
