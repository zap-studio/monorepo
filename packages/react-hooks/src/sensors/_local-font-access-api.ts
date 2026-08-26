/** A small copy of the Local Font Access API's types. This is an experimental API, only in Chrome, and not included in TypeScript's built-in types. */
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
  // SAFETY: window.queryLocalFonts is read as optional here, no matter what the current TypeScript DOM lib declares. On a browser that truly lacks it (like Safari or Firefox), this reads as undefined instead of throwing.
  return (window as WindowWithQueryLocalFonts).queryLocalFonts;
};
