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
 * Wraps the EyeDropper API — a single-shot native color picker.
 * `open()` resolves the picked color as an `sRGBHex` string (e.g.
 * `"#ff0000"`), or `undefined` if the user cancels (`Escape`, an aborted
 * `signal`) or the API is unsupported. `supported: false` — the SSR-safe
 * default — where the API doesn't exist (Chromium-only, no Safari/Firefox
 * support yet).
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
