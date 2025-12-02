import type { StandardSchemaV1 } from "@standard-schema/spec";

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

/**
 * Type-safe fetch function with Standard Schema validation support
 */
export type $Fetch = {
  /**
   * Fetch with schema validation
   * @param resource - URL or path to fetch
   * @param schema - Standard Schema for response validation
   * @param options - Extended request options
   * @returns Validated data or Standard Schema Result based on throwOnValidationError option
   */
  <TSchema extends StandardSchemaV1>(
    resource: string,
    schema: TSchema,
    options?: ExtendedRequestInit
  ): Promise<
    | StandardSchemaV1.InferOutput<TSchema>
    | StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>
  >;

  /**
   * Fetch without schema validation
   * @param resource - URL or path to fetch
   * @param options - Extended request options
   * @returns Raw Response object
   */
  (resource: string, options?: ExtendedRequestInit): Promise<Response>;
};

/**
 * API for creating HTTP method-specific fetch functions
 */
export type ApiMethods = {
  /**
   * GET method fetch function
   */
  get: $Fetch;
  /**
   * POST method fetch function
   */
  post: $Fetch;
  /**
   * PUT method fetch function
   */
  put: $Fetch;
  /**
   * DELETE method fetch function
   */
  delete: $Fetch;
  /**
   * PATCH method fetch function
   */
  patch: $Fetch;
};
