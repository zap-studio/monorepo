import { useEffect, useState } from "react";

/**
 * `true` once `document.fonts.ready` resolves — custom web fonts have
 * finished loading. Starts `false` (also the SSR-safe default); useful for
 * delaying text render to avoid FOUC. Resolves immediately to `true` where
 * the CSS Font Loading API is unsupported, rather than blocking forever.
 *
 * @example
 * ```tsx
 * const fontsReady = useFontsReady();
 * if (!fontsReady) return <Skeleton />;
 * ```
 */
export const useFontsReady = (): boolean => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) {
      setReady(true);
      return undefined;
    }

    let cancelled = false;

    const waitForFonts = async () => {
      await document.fonts.ready;
      if (!cancelled) {
        setReady(true);
      }
    };

    void waitForFonts();

    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
};
