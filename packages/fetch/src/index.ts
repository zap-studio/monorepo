/**
 * Public entrypoint for the fetch package.
 *
 * Re-exports the full public API. Every symbol is also available from a
 * dedicated subpath (`@zap-studio/fetch/fetch`, `@zap-studio/fetch/errors`,
 * ...) for consumers who prefer granular imports. All exports are side-effect
 * free and tree-shakeable.
 *
 * @module @zap-studio/fetch
 */

export { GLOBAL_DEFAULTS } from "./constants.js";
export { FetchError } from "./errors.js";
export { $fetch, api, createFetch } from "./fetch.js";
export { mergeHeaders } from "./headers.js";
export { normalizeRequest } from "./request.js";
export type { NormalizedRequest } from "./request.js";
export type {
  $Fetch,
  ApiMethods,
  ExtendedRequestInit,
  FetchDefaults,
  FetchInput,
} from "./types.js";
export { resolveRequestUrl } from "./url.js";
