import type { FetchDefaults } from "../types";

/**
 * Default options for the global $fetch
 */
export const GLOBAL_DEFAULTS = {
  baseURL: "",
  headers: undefined,
  throwOnFetchError: true,
  throwOnValidationError: true,
} as const satisfies FetchDefaults;
