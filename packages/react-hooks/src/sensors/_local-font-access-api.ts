/** A small copy of the Local Font Access API's types. This is an experimental, Chrome-only API, not declared elsewhere. */
export interface LocalFontData {
  blob(): Promise<Blob>;
  readonly family: string;
  readonly fullName: string;
  readonly postscriptName: string;
  readonly style: string;
}

/** Options `window.queryLocalFonts()` accepts. */
export interface QueryLocalFontsOptions {
  postscriptNames?: string[];
}

type QueryLocalFonts = (options?: QueryLocalFontsOptions) => Promise<LocalFontData[]>;

interface WindowWithQueryLocalFonts {
  queryLocalFonts?: QueryLocalFonts;
}

/**
 * Checks `typeof window === "undefined"`. `useExperimentalLocalFonts`
 * reads this directly in the hook body on every render, including
 * server-side rendering, not only inside an effect.
 */
export const getQueryLocalFonts = (): QueryLocalFonts | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // SAFETY: queryLocalFonts is not declared on Window. We read it as optional, so a browser without support (Safari, Firefox) gives undefined instead of throwing.
  return (window as WindowWithQueryLocalFonts).queryLocalFonts;
};
