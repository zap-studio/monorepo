import { vi } from "vitest";

/**
 * Fake `window.matchMedia` shared by the sensors category's media-query
 * tests. Not a hook, not shipped — excluded from the build by its `_` prefix.
 *
 * Wraps a real `MediaQueryList` (this suite runs in an actual browser via
 * `@vitest/browser-playwright`) so no properties need faking — only
 * `matches` is overridden, and `dispatchEvent` drives real listeners.
 */
export const createMatchMediaMock = (initialMatches: boolean) => {
  let matches = initialMatches;
  const mediaQueryList = window.matchMedia("not all");

  Object.defineProperty(mediaQueryList, "matches", {
    get: () => matches,
  });

  return {
    matchMedia: vi.fn<() => MediaQueryList>(() => mediaQueryList),
    setMatches: (value: boolean) => {
      matches = value;
      mediaQueryList.dispatchEvent(new Event("change"));
    },
  };
};
