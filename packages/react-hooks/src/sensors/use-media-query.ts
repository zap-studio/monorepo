import { useMediaQueryMatch } from "./_media-query.ts";

/**
 * Matches the current viewport against an arbitrary CSS media query string,
 * re-rendering when the match changes. SSR-safe — returns `false` until the
 * client subscribes via `matchMedia`.
 */
export const useMediaQuery = (query: string): boolean => useMediaQueryMatch(query);
