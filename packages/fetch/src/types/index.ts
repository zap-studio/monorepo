/**
 * Extended RequestInit type to include custom fetch options
 */
export type RequestInitExtended = Omit<RequestInit, "body"> & {
  /**
   * Body of the request. Can be a plain object/array (will be JSON stringified)
   * or any valid BodyInit (Blob, BufferSource, FormData, URLSearchParams, ReadableStream, string).
   */
  body?: unknown;
  /**
   * Whether to throw a FetchError on HTTP errors (non-2xx responses)
   */
  throwOnFetchError?: boolean;
  /**
   * Whether to throw a ValidationError on validation errors
   */
  throwOnValidationError?: boolean;
  /**
   * Expected response type from the fetch call
   */
  responseType?: ResponseType;
};

/**
 * Response types supported by the fetch wrapper (e.g., 'json', 'text', etc.)
 */
type ResponsePromiseMethodNames = {
  [K in keyof Response]: Response[K] extends () => Promise<unknown> ? K : never;
}[keyof Response];

/**
 * Method name for Response.clone()
 */
type ResponseCloneMethodName = {
  [K in keyof Response]: Response[K] extends () => Response ? K : never;
}[keyof Response];

/**
 * Union type of supported response types
 */
export type ResponseType = ResponsePromiseMethodNames | ResponseCloneMethodName;

/**
 * Mapping of ResponseType to actual response data types
 */
export type ResponseTypeMap = {
  [K in ResponseType]: K extends keyof Response
    ? Awaited<ReturnType<Response[K]>>
    : never;
};

/**
 * Type of response data based on the specified ResponseType
 */
export type ResponseData<T extends ResponseType> = ResponseTypeMap[T];
