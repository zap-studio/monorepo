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
  /**
   * Expected response type from the fetch call
   */
  responseType?: ResponseType;
};

/**
 * Response types supported by the fetch wrapper
 */
export type ResponseType =
  | "arrayBuffer"
  | "blob"
  | "bytes"
  | "clone"
  | "formData"
  | "json"
  | "text";

/**
 * Mapping of ResponseType to actual response data types
 */
export type ResponseTypeMap = {
  arrayBuffer: ArrayBuffer;
  blob: Blob;
  bytes: Uint8Array;
  clone: Response;
  formData: FormData;
  json: unknown;
  text: string;
};
