import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Type representing various formats for search parameters
 * that can be used in requests.
 * Can be a URLSearchParams object, a record of string pairs,
 * a query string, or an array of tuples.
 */
export type SearchParams =
  | URLSearchParams
  | Record<string, string>
  | string
  | [string, string][];

/**
 * Base extended request options without throwOnValidationError
 */
type BaseExtendedRequestInit = Omit<RequestInit, "body"> & {
  /**
   * Request body - can be a BodyInit value or an object that will be JSON-stringified
   */
  body?: BodyInit | Record<string, unknown>;
  /**
   * Per-request query/search params
   * @default undefined
   */
  searchParams?: SearchParams;
  /**
   * Whether to throw a FetchError on HTTP errors (non-2xx responses)
   * @default true
   */
  throwOnFetchError?: boolean;
};

/**
 * Extended RequestInit type to include custom fetch options
 */
export type ExtendedRequestInit<
  TThrowOnValidationError extends boolean | undefined = boolean | undefined,
> = BaseExtendedRequestInit & {
  /**
   * Whether to throw a ValidationError on validation errors
   * @default true
   */
  throwOnValidationError?: TThrowOnValidationError;
};

/**
 * Internal defaults used by fetchInternal
 */
export interface FetchDefaults {
  /**
   * Base URL to prepend to all requests
   * @default ""
   */
  baseURL: string;
  /**
   * Default headers to include in all requests (can be overridden per request)
   * @default undefined
   */
  headers?: HeadersInit;
  /**
   * Default query/search params applied to every request (can be overridden per request)
   * @default undefined
   */
  searchParams?: SearchParams;
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
}

/**
 * Options for creating a custom fetch instance with `createFetch`
 */
export type CreateFetchOptions = Partial<FetchDefaults>;

/**
 * Type-safe fetch function with Standard Schema validation support
 */
export interface $Fetch {
  /**
   * Fetch with schema validation and throwOnValidationError: false
   * @param resource - URL or path to fetch
   * @param schema - Standard Schema for response validation
   * @param options - Extended request options with throwOnValidationError: false
   * @returns Standard Schema Result object with value or issues
   */
  <TSchema extends StandardSchemaV1>(
    resource: string,
    schema: TSchema,
    options: ExtendedRequestInit<false>
  ): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;

  /**
   * Fetch with schema validation and throwOnValidationError: true or undefined (default)
   * @param resource - URL or path to fetch
   * @param schema - Standard Schema for response validation
   * @param options - Extended request options
   * @returns Validated data of type TSchema
   */
  <TSchema extends StandardSchemaV1>(
    resource: string,
    schema: TSchema,
    options?: ExtendedRequestInit<true | undefined>
  ): Promise<StandardSchemaV1.InferOutput<TSchema>>;

  /**
   * Fetch without schema validation
   * @param resource - URL or path to fetch
   * @param options - Extended request options
   * @returns Raw Response object
   */
  (resource: string, options?: ExtendedRequestInit): Promise<Response>;
}

/**
 * API HTTP method-specific fetch functions
 */
export interface ApiMethods {
  /**
   * DELETE method fetch function
   */
  delete: $Fetch;
  /**
   * GET method fetch function
   */
  get: $Fetch;
  /**
   * PATCH method fetch function
   */
  patch: $Fetch;
  /**
   * POST method fetch function
   */
  post: $Fetch;
  /**
   * PUT method fetch function
   */
  put: $Fetch;
}
