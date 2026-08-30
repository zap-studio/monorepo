import { useCallback, useMemo } from "react";

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
 * Reads the fonts installed on the user's device, using
 * `window.queryLocalFonts()` (Local Font Access API). This is
 * experimental, only works in Chrome, and needs the `"local-fonts"`
 * permission.
 *
 * Call `query()` to ask for that permission and get the list of locally
 * installed fonts. It returns `undefined` if the user denies the prompt or
 * if the browser doesn't support this API.
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

  return useMemo(() => ({ query, supported }), [query, supported]);
};
