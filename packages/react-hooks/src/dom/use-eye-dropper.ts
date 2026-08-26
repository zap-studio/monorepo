import { useCallback } from "react";

import { getEyeDropperConstructor, type EyeDropperOpenOptions } from "./_eye-dropper-api.ts";

/** The shape returned by `useEyeDropper`. */
export interface UseEyeDropperResult {
  open: (options?: EyeDropperOpenOptions) => Promise<string | undefined>;
  supported: boolean;
}

const isAbortError = (error: unknown): boolean =>
  error instanceof Error && error.name === "AbortError";

/**
 * Wraps the EyeDropper API, a native color picker built into the browser.
 * `open()` resolves with the picked color as an `sRGBHex` string (for
 * example `"#ff0000"`). It resolves to `undefined` if the user cancels (by
 * pressing Escape or aborting the `signal`) or if the API isn't supported.
 * `supported` is `false` by default (safe for server rendering), which
 * happens where the API doesn't exist — it only works in Chromium
 * browsers, not yet in Safari or Firefox.
 *
 * @example
 * ```tsx
 * const { open, supported } = useEyeDropper();
 * const hex = supported ? await open() : undefined;
 * ```
 */
export const useEyeDropper = (): UseEyeDropperResult => {
  const supported = Boolean(getEyeDropperConstructor());

  const open = useCallback(async (options?: EyeDropperOpenOptions): Promise<string | undefined> => {
    const EyeDropperCtor = getEyeDropperConstructor();
    if (!EyeDropperCtor) {
      return undefined;
    }
    try {
      const result = await new EyeDropperCtor().open(options);
      return result.sRGBHex;
    } catch (error) {
      if (isAbortError(error)) {
        return undefined;
      }
      throw error;
    }
  }, []);

  return { open, supported };
};
