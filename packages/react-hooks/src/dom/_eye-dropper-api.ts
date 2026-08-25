/** Minimal local model of the EyeDropper API — Chromium-only, not declared in every TypeScript DOM lib. */
export interface EyeDropperOpenOptions {
  signal?: AbortSignal;
}

/** Minimal local model of the EyeDropper API — Chromium-only, not declared in every TypeScript DOM lib. */
// fallow-ignore-next-line unused-type
export interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperConstructor {
  new (): { open: (options?: EyeDropperOpenOptions) => Promise<EyeDropperResult> };
}

interface EyeDropperWindow {
  EyeDropper?: EyeDropperConstructor;
}

/**
 * Guards `typeof window === "undefined"` because `useEyeDropper` reads
 * this synchronously in the hook body, on every render including SSR —
 * not just from an effect.
 */
export const getEyeDropperConstructor = (): EyeDropperConstructor | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // SAFETY: window.EyeDropper is read as optional here regardless of how (or whether) the resolved TypeScript version's DOM lib declares it, so a browser where it's genuinely absent (Safari, Firefox) degrades to undefined rather than throwing.
  return (window as EyeDropperWindow).EyeDropper;
};
