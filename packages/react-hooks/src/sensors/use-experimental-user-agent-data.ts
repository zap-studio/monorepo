import { useCallback, useRef, useSyncExternalStore } from "react";

/** One entry in `UserAgentData.brands`. */
export interface UserAgentDataBrand {
  brand: string;
  version: string;
}

/** The shape returned by `useExperimentalUserAgentData`: the basic fields from `navigator.userAgentData`. */
export interface UserAgentData {
  brands: readonly UserAgentDataBrand[];
  mobile: boolean;
  platform: string;
}

interface NavigatorWithUserAgentData extends Navigator {
  readonly userAgentData?: UserAgentData;
}

const subscribe = () => () => {};

const brandsEqual = (a: readonly UserAgentDataBrand[], b: readonly UserAgentDataBrand[]): boolean =>
  a.length === b.length &&
  a.every((brand, index) => brand.brand === b[index]?.brand && brand.version === b[index]?.version);

const dataEqual = (a: UserAgentData | undefined, b: UserAgentData | undefined): boolean => {
  if (a === undefined || b === undefined) {
    return a === b;
  }
  return a.mobile === b.mobile && a.platform === b.platform && brandsEqual(a.brands, b.brands);
};

/**
 * Gives you basic browser info (`brands`, `mobile`, `platform`) from
 * `navigator.userAgentData`. This is a newer, more structured way to get
 * this data instead of parsing the `navigator.userAgent` string. The
 * User-Agent Client Hints API is experimental (see MDN), and only works
 * in Chromium browsers (like Chrome and Edge). This information doesn't
 * change while the app is running. The value is `undefined` (the safe
 * default for server rendering) when the API isn't supported.
 *
 * @example
 * ```tsx
 * const uaData = useExperimentalUserAgentData();
 * const isMobile = uaData?.mobile ?? false;
 * ```
 */
export const useExperimentalUserAgentData = (): UserAgentData | undefined => {
  const cacheRef = useRef<UserAgentData | undefined>(undefined);

  const getSnapshot = useCallback((): UserAgentData | undefined => {
    // SAFETY: userAgentData (User-Agent Client Hints) is a Chromium-only API that TypeScript's DOM types don't include. We read it as optional, so unsupported browsers give undefined instead of throwing an error.
    const next = (navigator as NavigatorWithUserAgentData).userAgentData;
    if (!dataEqual(cacheRef.current, next)) {
      cacheRef.current = next;
    }
    return cacheRef.current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, () => undefined);
};
