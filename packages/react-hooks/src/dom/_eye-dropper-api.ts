/** A simple local copy of the EyeDropper API types. It only works in Chromium browsers. */
export interface EyeDropperOpenOptions {
  signal?: AbortSignal;
}

/** A simple local copy of the EyeDropper API types. It only works in Chromium browsers. */
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
  // SAFETY: EyeDropper isn't declared on Window; read as optional so an unsupported browser (Safari, Firefox) gives undefined instead of throwing.
  return (window as EyeDropperWindow).EyeDropper;
};
