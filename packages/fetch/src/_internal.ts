/**
 * Internal request execution and option preparation utilities.
 *
 * @module @zap-studio/fetch/_internal (private)
 */

import type { StandardSchemaV1 } from "@zap-studio/validation";
import { standardValidate } from "@zap-studio/validation";

import { FetchError } from "./errors.js";
import { mergeHeaders } from "./headers.js";
import { normalizeRequest } from "./request.js";
import type {
  ExtendedRequestInit,
  FetchDefaults,
  FetchInput,
} from "./types.js";
import { resolveRequestUrl } from "./url.js";

/**
 * Normalizes request-level options into a final RequestInit payload and runtime flags.
 *
 * @param options - Request-level options.
 * @param defaults - Client-level defaults.
 * @returns Fully merged request init payload and effective runtime flags.
 */
const prepareRequestInit = (
  options: ExtendedRequestInit,
  defaults: FetchDefaults
): {
  init: RequestInit;
  searchParams: ExtendedRequestInit["searchParams"] | undefined;
  throwOnFetchError: boolean;
  throwOnValidationError: boolean;
} => {
  const {
    headers,
    json,
    searchParams,
    throwOnFetchError = defaults.throwOnFetchError,
    throwOnValidationError = defaults.throwOnValidationError,
    ...rest
  } = options;

  const init: RequestInit = { ...rest };
  const mergedHeaders = mergeHeaders(defaults.headers, headers);
  if (mergedHeaders !== undefined) {
    init.headers = mergedHeaders;
  }

  if (json !== undefined) {
    if (init.body !== undefined && init.body !== null) {
      throw new TypeError("Cannot provide both `body` and `json`.");
    }

    init.body = JSON.stringify(json);
    if (init.headers === undefined) {
      init.headers = new Headers({ "Content-Type": "application/json" });
    } else {
      const requestHeaders = new Headers(init.headers);
      if (!requestHeaders.has("Content-Type")) {
        requestHeaders.set("Content-Type", "application/json");
      }
      init.headers = requestHeaders;
    }
  }

  return {
    init,
    searchParams,
    throwOnFetchError,
    throwOnValidationError,
  };
};

/**
 * Internal fetch implementation used by both $fetch and createFetch.
 *
 * This function normalizes request input, resolves final URL + query params,
 * executes `fetch`, optionally throws `FetchError`, and optionally validates
 * JSON response payloads using Standard Schema.
 *
 * @param input - Request URL, path, or Request object.
 * @param schema - Optional Standard Schema for response validation.
 * @param options - Optional request options and package-specific flags.
 * @param defaults - Effective client defaults.
 * @returns Raw `Response` when no schema is provided; otherwise validated output.
 * @throws {FetchError} When `throwOnFetchError` is `true` and the response is not ok.
 * @throws {ValidationError} When a schema is provided, validation returns issues, and
 *   `throwOnValidationError` is `true`.
 * @throws {TypeError} When both `body` and `json` are provided, when JSON request
 *   serialization fails, when request construction fails, when headers/search params are
 *   invalid, when `response.json()` cannot read the body, or when the runtime `fetch`
 *   implementation rejects network-level failures as `TypeError`.
 * @throws {DOMException} When the runtime rejects an aborted request or response body read
 *   as an `AbortError` DOMException.
 * @throws {SyntaxError} When a schema is provided and `response.json()` cannot parse the
 *   response body.
 * @throws {unknown} Any error thrown or rejected by the provided Standard Schema validator.
 */
export const fetchInternal = async (
  input: FetchInput,
  schema: StandardSchemaV1 | undefined,
  options: ExtendedRequestInit | undefined,
  defaults: FetchDefaults
): Promise<unknown> => {
  const request = normalizeRequest(input, options);
  const { init, searchParams, throwOnFetchError, throwOnValidationError } =
    prepareRequestInit(request.options, defaults);
  const url = resolveRequestUrl(request.url, defaults, searchParams);
  const response = request.request
    ? await fetch(new Request(url, request.request), init)
    : await fetch(url, init);

  if (throwOnFetchError && !response.ok) {
    throw new FetchError(
      `HTTP ${response.status}: ${response.statusText}`,
      response
    );
  }

  if (schema === undefined) {
    return response;
  }

  const raw: unknown = await response.json();
  if (throwOnValidationError) {
    return await standardValidate(schema, raw, { throwOnError: true });
  }
  return await standardValidate(schema, raw, { throwOnError: false });
};
