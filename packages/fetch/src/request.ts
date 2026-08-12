/**
 * Request normalization helpers for fetch `input` values.
 *
 * @module @zap-studio/fetch/request
 */

import { mergeHeaders } from "./headers.js";
import type { ExtendedRequestInit, FetchInput } from "./types.js";

const EMPTY_OPTIONS = {} as ExtendedRequestInit;

/**
 * Normalized representation used by internal request execution.
 */
export interface NormalizedRequest {
  /** Resolved string URL from the input (string or `URL`; `Request` uses `request.url`). */
  url: string;
  /** Original `Request` clone, present when the input was a `Request`. */
  request?: Request;
  /** Normalized request options merged with `Request` headers. */
  options: ExtendedRequestInit;
}

/**
 * Normalizes fetch `input` and request-level options into a consistent internal shape.
 *
 * @param input - Request URL/path or Request instance.
 * @param options - Optional request options.
 * @returns A normalized request structure for internal processing.
 * @throws {TypeError} When cloning a `Request` fails or the merged headers are invalid.
 *
 * @example
 * const normalized = normalizeRequest("/users", { method: "GET" });
 * console.log(normalized.url); // "/users"
 */
export const normalizeRequest = (
  input: FetchInput,
  options?: ExtendedRequestInit
): NormalizedRequest => {
  if (!(input instanceof Request)) {
    const url = input instanceof URL ? input.href : input;
    return {
      options: options ?? EMPTY_OPTIONS,
      url,
    };
  }

  const request = new Request(input);
  const { headers, ...rest } = options ?? {};
  const mergedHeaders = mergeHeaders(request.headers, headers);
  const normalizedOptions = { ...rest } as ExtendedRequestInit;

  if (mergedHeaders !== undefined) {
    normalizedOptions.headers = mergedHeaders;
  }

  return {
    options: normalizedOptions,
    request,
    url: request.url,
  };
};
