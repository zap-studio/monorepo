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

/** `window.screen` with its `EventTarget` methods marked optional. This is a helper shape used for the cast below, since `Screen` and `EventTarget` don't otherwise overlap. */
interface ScreenWithOptionalEventTarget {
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
}

/** The `EventTarget` methods of `window.screen`, used for its `change` event. Not declared on `Screen`, but every browser's `screen` object supports them, so they're always available. */
export interface ScreenChangeEventTarget {
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
  // SAFETY: getScreenDetails isn't declared on Window; read as optional so an unsupported browser (Safari, Firefox) gives undefined instead of throwing.
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
  // SAFETY: isExtended isn't declared on Screen; read as optional so an unsupported browser reads as false instead of throwing.
  Boolean((window.screen as ScreenWithIsExtended).isExtended);

/**
 * Casts `window.screen` so its `addEventListener`/`removeEventListener`
 * (used for the `change` event) become available. This only ever runs on
 * the client, as `useSyncExternalStore`'s `subscribe`, so it needs no
 * server guard — the same as `subscribe` in `use-window-size.ts`, which
 * calls `window.addEventListener` directly.
 */
export const getScreenEventTarget = (): ScreenChangeEventTarget => {
  // SAFETY: Screen's addEventListener/removeEventListener aren't declared, so it's cast through an all-optional shape first.
  const withOptionalEventTarget = window.screen as ScreenWithOptionalEventTarget;
  // SAFETY: every browser's `screen` supports these as an EventTarget, so they're safe to treat as always present.
  return withOptionalEventTarget as ScreenChangeEventTarget;
};
