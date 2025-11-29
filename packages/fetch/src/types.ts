/**
 * Extended RequestInit type to include custom fetch options
 */
export type RequestInitExtended = RequestInit & {
  /**
   * Whether to throw a FetchError on HTTP errors (non-2xx responses)
   */
  throwOnFetchError?: boolean;
  /**
   * Whether to throw a ValidationError on validation errors
   */
  throwOnValidationError?: boolean;
};
