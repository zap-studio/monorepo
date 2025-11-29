/**
 * Extended RequestInit type to include custom fetch options
 */
export type RequestInitExtended = RequestInit & {
  /**
   * Whether to throw a FetchError on HTTP errors (non-2xx responses)
   * @default true
   */
  throwOnFetchError?: boolean;
  /**
   * Whether to throw a ValidationError on validation errors
   * @default true
   */
  throwOnValidationError?: boolean;
};

/**
 * Options for creating a custom fetch instance with `createFetch`
 */
export type CreateFetchOptions = {
  /**
   * Base URL to prepend to all requests
   * @example "https://api.example.com"
   */
  baseURL?: string;
  /**
   * Default headers to include in all requests
   * @example { "Authorization": "Bearer token" }
   */
  headers?: HeadersInit;
  /**
   * Default value for throwOnFetchError (defaults to true)
   */
  throwOnFetchError?: boolean;
  /**
   * Default value for throwOnValidationError (defaults to true)
   */
  throwOnValidationError?: boolean;
};
