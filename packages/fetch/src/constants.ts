import type { FetchDefaults } from "./types.js";

/**
 * Default options for the global $fetch
 */
export const GLOBAL_DEFAULTS: FetchDefaults = {
  baseURL: "",
  throwOnFetchError: true,
  throwOnValidationError: true,
};
