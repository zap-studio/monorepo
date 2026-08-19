import { useCallback, useRef, useSyncExternalStore } from "react";

export interface UserAgentDataBrand {
  brand: string;
  version: string;
}

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
 * `navigator.userAgentData`'s low-entropy fields (`brands`, `mobile`,
 * `platform`) — a structured, Chromium-only replacement for parsing
 * `navigator.userAgent`. A static device capability — doesn't change at
 * runtime. `undefined` — the SSR-safe default — where User-Agent Client
 * Hints is unsupported.
 *
 * @example
 * ```tsx
 * const uaData = useUserAgentData();
 * const isMobile = uaData?.mobile ?? false;
 * ```
 */
export const useUserAgentData = (): UserAgentData | undefined => {
  const cacheRef = useRef<UserAgentData | undefined>(undefined);

  const getSnapshot = useCallback((): UserAgentData | undefined => {
    // SAFETY: userAgentData (User-Agent Client Hints) is a Chromium-only API not declared in TypeScript's DOM lib; read as optional, so an unsupported browser yields undefined rather than throwing.
    const next = (navigator as NavigatorWithUserAgentData).userAgentData;
    if (!dataEqual(cacheRef.current, next)) {
      cacheRef.current = next;
    }
    return cacheRef.current;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, () => undefined);
};
