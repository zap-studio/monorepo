/** A small copy of the Window Management API's types. This is an experimental API, not declared elsewhere. */

/** One connected display, reported by `getScreenDetails()`. It extends the standard `Screen` type with position and identity fields. */
export interface ScreenDetailed extends Screen {
  readonly availLeft: number;
  readonly availTop: number;
  readonly devicePixelRatio: number;
  readonly isInternal: boolean;
  readonly isPrimary: boolean;
  readonly label: string;
  readonly left: number;
  readonly top: number;
}

/** The result of `getScreenDetails()`. It lists every connected display and updates live when they change. */
export interface ScreenDetails extends EventTarget {
  readonly currentScreen: ScreenDetailed;
  readonly screens: readonly ScreenDetailed[];
}

type GetScreenDetails = () => Promise<ScreenDetails>;

interface WindowWithScreenDetails {
  getScreenDetails?: GetScreenDetails;
}

interface ScreenWithIsExtended {
  isExtended?: boolean;
}

/** The `EventTarget` methods of `window.screen`, used for its `change` event. Not declared on `Screen`, but every browser's `screen` object supports them, so they're always available. Extending `Screen` keeps this a plain narrowing of `window.screen`. */
export interface ScreenChangeEventTarget extends Screen {
  addEventListener: (type: "change", listener: () => void) => void;
  removeEventListener: (type: "change", listener: () => void) => void;
}

/**
 * Checks `typeof window === "undefined"`. `useExperimentalWindowManagement`
 * reads this directly in the hook body on every render, including
 * server-side rendering, not only inside an effect.
 */
export const getScreenDetailsFn = (): GetScreenDetails | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // SAFETY: Window does not declare getScreenDetails. We read it as optional, so a browser without it (Safari, Firefox) gives undefined instead of throwing.
  return (window as WindowWithScreenDetails).getScreenDetails;
};

/**
 * Reads `window.screen.isExtended`. This is `true` once more than one
 * display is available to the device, and you can read it without asking
 * for the `"window-management"` permission. It only ever runs on the
 * client, as `useSyncExternalStore`'s `getSnapshot`, so it needs no server
 * guard — the same as `getSnapshot` in `use-window-size.ts`, which reads
 * `window.innerWidth` directly.
 */
export const getIsExtended = (): boolean =>
  // SAFETY: Screen does not declare isExtended. We read it as optional, so a browser without it reads as false instead of throwing.
  Boolean((window.screen as ScreenWithIsExtended).isExtended);

/**
 * Casts `window.screen` so its `addEventListener`/`removeEventListener`
 * (used for the `change` event) become available. This only ever runs on
 * the client, as `useSyncExternalStore`'s `subscribe`, so it needs no
 * server guard — the same as `subscribe` in `use-window-size.ts`, which
 * calls `window.addEventListener` directly.
 */
export const getScreenEventTarget = (): ScreenChangeEventTarget =>
  // SAFETY: Screen does not declare addEventListener/removeEventListener, but `screen` is an EventTarget in every browser, so these two methods are always there.
  window.screen as ScreenChangeEventTarget;
