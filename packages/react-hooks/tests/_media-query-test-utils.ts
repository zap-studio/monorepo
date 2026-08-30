import type { Mock } from "vitest";

import { vi } from "vitest";

interface MatchMediaMock {
  matchMedia: Mock<() => MediaQueryList>;
  setMatches: (value: boolean) => void;
}

/**
 * A fake `window.matchMedia`, shared by the media-query tests in this
 * category. It is not a hook and is not shipped: the `_` prefix on the
 * filename excludes it from the build.
 *
 * This wraps a real `MediaQueryList` (the tests run in an actual browser
 * through `@vitest/browser-playwright`), so most properties work as normal.
 * Only `matches` is replaced, and `dispatchEvent` triggers the real listeners.
 */
export const createMatchMediaMock = (initialMatches: boolean): MatchMediaMock => {
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
