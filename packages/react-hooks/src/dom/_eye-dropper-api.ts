/** A simple local copy of the EyeDropper API types. It only works in Chromium browsers, and not every version of TypeScript's DOM types includes it. */
export interface EyeDropperOpenOptions {
  signal?: AbortSignal;
}

/** A simple local copy of the EyeDropper API types. It only works in Chromium browsers, and not every version of TypeScript's DOM types includes it. */
interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperConstructor {
  new (): { open: (options?: EyeDropperOpenOptions) => Promise<EyeDropperResult> };
}

interface EyeDropperWindow {
  EyeDropper?: EyeDropperConstructor;
}

/**
 * Checks for `typeof window === "undefined"`. This is needed because
 * `useExperimentalEyeDropper` calls this function directly during render
 * (including on the server), not just inside an effect.
 */
export const getEyeDropperConstructor = (): EyeDropperConstructor | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // SAFETY: we read window.EyeDropper as optional, no matter what the current TypeScript DOM types say. This way, a browser that doesn't have it (Safari, Firefox) just gives us undefined instead of an error.
  return (window as EyeDropperWindow).EyeDropper;
};
