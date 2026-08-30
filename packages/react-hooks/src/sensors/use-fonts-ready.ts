import { useEffect, useState } from "react";

import { useIsClient } from "./use-is-client.ts";

/**
 * `true` once `document.fonts.ready` resolves, meaning custom web fonts
 * have finished loading. Starts as `false` (also the safe default for
 * server rendering). Useful for delaying text rendering to avoid a flash
 * of unstyled text. Resolves right away to `true` if the browser doesn't
 * support the CSS Font Loading API, instead of waiting forever.
 *
 * @example
 * ```tsx
 * const fontsReady = useFontsReady();
 * if (!fontsReady) return <Skeleton />;
 * ```
 */
export const useFontsReady = (): boolean => {
  const isClient = useIsClient();
  const supported = isClient && typeof document !== "undefined" && !!document.fonts;
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!supported) {
      return undefined;
    }

    let cancelled = false;

    const waitForFonts = async () => {
      await document.fonts.ready;
      if (!cancelled) {
        setLoaded(true);
      }
    };

    void waitForFonts();

    return () => {
      cancelled = true;
    };
  }, [supported]);

  return supported ? loaded : isClient;
};
