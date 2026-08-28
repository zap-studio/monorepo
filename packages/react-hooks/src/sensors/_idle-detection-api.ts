/** A small copy of the Idle Detection API's types. This is an experimental, Chrome-only API, not declared elsewhere. */
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
  // SAFETY: IdleDetector isn't declared on Window; read as optional so an unsupported browser (Safari, Firefox) gives undefined instead of throwing.
  return (window as IdleDetectionWindow).IdleDetector;
};
