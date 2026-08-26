/** A small copy of the Idle Detection API's types. This is an experimental API, only in Chrome, and not included in TypeScript's built-in types. */
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
 * Checks `typeof window === "undefined"`. `useExperimentalIdleDetector`
 * reads this directly in the hook body on every render, including
 * server-side rendering, not only inside an effect.
 */
export const getIdleDetectorConstructor = (): IdleDetectorConstructor | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // SAFETY: window.IdleDetector is read as optional here, no matter what the current TypeScript DOM lib declares. On a browser that truly lacks it (like Safari or Firefox), this reads as undefined instead of throwing.
  return (window as IdleDetectionWindow).IdleDetector;
};
