/**
 * Extended RequestInit type to include custom fetch options
 */
export type ExtendedRequestInit = Omit<RequestInit, "body"> & {
  /**
   * Request body - can be a BodyInit value or an object that will be JSON-stringified
   */
  body?: BodyInit | Record<string, unknown>;
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
 * Internal defaults used by fetchInternal
 */
export type FetchDefaults = {
  /**
   * Base URL to prepend to all requests
   * @default ""
   */
  baseURL: string;
  /**
   * Default headers to include in all requests
   * @default undefined
   */
  headers: HeadersInit | undefined;
  /**
   * Whether to throw a `FetchError` on HTTP errors (non-2xx responses)
   * @default true
   */
  throwOnFetchError: boolean;
  /**
   * Whether to throw a `ValidationError` on validation errors
   * @default true
   */
  throwOnValidationError: boolean;
};

/**
 * Options for creating a custom fetch instance with `createFetch`
 */
export type CreateFetchOptions = Partial<FetchDefaults>;
