/** Minimal local model of the Local Font Access API — Experimental per MDN, Chromium-only, not declared in every TypeScript DOM lib. */
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
 * Guards `typeof window === "undefined"` because `useExperimentalLocalFonts`
 * reads this synchronously in the hook body, on every render including SSR —
 * not just from an effect.
 */
export const getQueryLocalFonts = (): QueryLocalFonts | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // SAFETY: window.queryLocalFonts is read as optional here regardless of how (or whether) the resolved TypeScript version's DOM lib declares it, so a browser where it's genuinely absent (Safari, Firefox) degrades to undefined rather than throwing.
  return (window as WindowWithQueryLocalFonts).queryLocalFonts;
};
