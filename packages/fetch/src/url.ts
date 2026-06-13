/**
 * URL resolution and query merging utilities.
 *
 * @module @zap-studio/fetch/url
 */

import type { ExtendedRequestInit, FetchDefaults } from "./types.js";

// oxlint-disable no-use-before-define, no-negated-condition -- Helpers are ordered by public API and URL fragment parsing is clearer with paired ternaries.

/**
 * Resolves final request URL by applying baseURL and layered search params.
 *
 * Search param precedence:
 * 1. `defaults.searchParams`
 * 2. search params already present in `resourceUrl`
 * 3. per-request `searchParams`
 *
 * @example
 * const finalUrl = resolveRequestUrl(
 *   "/users?page=2",
 *   { ...defaults, baseURL: "https://api.example.com", searchParams: { locale: "en" } },
 *   { page: "3" },
 * );
 * // https://api.example.com/users?locale=en&page=3
 *
 * @throws {TypeError} When `baseURL` and `resourceUrl` cannot be resolved by
 *   `URL`, or when default/per-request search params cannot be converted by
 *   `URLSearchParams`.
 */
export const resolveRequestUrl = (
  resourceUrl: string,
  defaults: FetchDefaults,
  searchParams: ExtendedRequestInit["searchParams"] | undefined
): string => {
  const url = defaults.baseURL
    ? new URL(resourceUrl, ensureTrailingSlash(defaults.baseURL)).toString()
    : resourceUrl;

  return resolveSearchParams(url, defaults.searchParams, searchParams);
};

/**
 * Resolves search params by applying default params, URL params, then request params.
 */
const resolveSearchParams = (
  url: string,
  defaultSearchParams: FetchDefaults["searchParams"] | undefined,
  searchParams: ExtendedRequestInit["searchParams"] | undefined
): string => {
  if (defaultSearchParams === undefined && searchParams === undefined) {
    return url;
  }

  const hashIndex = url.indexOf("#");
  const hasFragment = hashIndex !== -1;
  const urlWithoutHash = hasFragment ? url.slice(0, hashIndex) : url;
  const hash = hasFragment ? url.slice(hashIndex + 1) : "";
  const queryIndex = urlWithoutHash.indexOf("?");
  const pathname =
    queryIndex !== -1 ? urlWithoutHash.slice(0, queryIndex) : urlWithoutHash;
  const urlSearchParams =
    queryIndex !== -1 ? urlWithoutHash.slice(queryIndex + 1) : undefined;
  const resolvedSearchParams = new URLSearchParams();

  mergeSearchParams(resolvedSearchParams, defaultSearchParams);
  mergeSearchParams(resolvedSearchParams, urlSearchParams);
  mergeSearchParams(resolvedSearchParams, searchParams);

  const resolvedSearch = resolvedSearchParams.toString();
  const fragmentSuffix = hasFragment ? `#${hash}` : "";

  if (resolvedSearch.length === 0) {
    return `${pathname}${fragmentSuffix}`;
  }

  return `${pathname}?${resolvedSearch}${fragmentSuffix}`;
};

/**
 * Ensures a URL has a trailing slash for relative URL resolution.
 */
const ensureTrailingSlash = (url: string): string =>
  url.endsWith("/") ? url : `${url}/`;

/**
 * Copies search params into target, overriding duplicate keys.
 */
const mergeSearchParams = (
  target: URLSearchParams,
  source: ExtendedRequestInit["searchParams"] | undefined
): void => {
  for (const [key, value] of new URLSearchParams(source)) {
    target.set(key, value);
  }
};
