import { useCallback } from "react";

import {
  getQueryLocalFonts,
  type LocalFontData,
  type QueryLocalFontsOptions,
} from "./_local-font-access-api.ts";

export type { LocalFontData, QueryLocalFontsOptions } from "./_local-font-access-api.ts";

/** The shape returned by `useExperimentalLocalFonts`. */
export interface UseExperimentalLocalFontsResult {
  query: (options?: QueryLocalFontsOptions) => Promise<LocalFontData[] | undefined>;
  supported: boolean;
}

const isAbortError = (error: unknown): boolean =>
  error instanceof Error && error.name === "NotAllowedError";

/**
 * Wraps `window.queryLocalFonts()` (Local Font Access API) — Experimental
 * per MDN, Chromium-only, requires the `"local-fonts"` permission. `query()`
 * prompts for that permission on first call and resolves the user's
 * locally installed fonts, or `undefined` when the user denies the
 * prompt (`NotAllowedError`) or the API is unsupported.
 *
 * @example
 * ```tsx
 * const { query, supported } = useExperimentalLocalFonts();
 * const fonts = supported ? await query() : undefined;
 * ```
 */
export const useExperimentalLocalFonts = (): UseExperimentalLocalFontsResult => {
  const supported = Boolean(getQueryLocalFonts());

  const query = useCallback(
    async (options?: QueryLocalFontsOptions): Promise<LocalFontData[] | undefined> => {
      const queryLocalFonts = getQueryLocalFonts();
      if (!queryLocalFonts) {
        return undefined;
      }
      try {
        return await queryLocalFonts(options);
      } catch (error) {
        if (isAbortError(error)) {
          return undefined;
        }
        throw error;
      }
    },
    [],
  );

  return { query, supported };
};
