/** Minimal local model of the Idle Detection API — Experimental per MDN, Chromium-only, not declared in every TypeScript DOM lib. */
export type IdleScreenState = "locked" | "unlocked";
/** Whether the user has interacted with the device within the detector's idle threshold. */
export type IdleUserState = "active" | "idle";

/** Options `IdleDetector.start()` accepts. */
export interface IdleDetectorStartOptions {
  signal?: AbortSignal;
  threshold?: number;
}

interface IdleDetector extends EventTarget {
  readonly screenState: IdleScreenState;
  start(options: IdleDetectorStartOptions): Promise<void>;
  readonly userState: IdleUserState;
}

interface IdleDetectorConstructor {
  new (): IdleDetector;
  requestPermission(): Promise<"denied" | "granted" | "prompt">;
}

interface IdleDetectionWindow {
  IdleDetector?: IdleDetectorConstructor;
}

/**
 * Guards `typeof window === "undefined"` because `useExperimentalIdleDetector`
 * reads this synchronously in the hook body, on every render including SSR —
 * not just from an effect.
 */
export const getIdleDetectorConstructor = (): IdleDetectorConstructor | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // SAFETY: window.IdleDetector is read as optional here regardless of how (or whether) the resolved TypeScript version's DOM lib declares it, so a browser where it's genuinely absent (Safari, Firefox) degrades to undefined rather than throwing.
  return (window as IdleDetectionWindow).IdleDetector;
};
