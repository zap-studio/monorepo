/** A small copy of the Window Management API's types. This is an experimental API and not included in TypeScript's built-in types. */

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

/** The `EventTarget` methods of `window.screen`, used for its `change` event. TypeScript's `Screen` type doesn't declare them, but every browser's `screen` object supports them, so they're always available. */
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
  // SAFETY: window.getScreenDetails is read as optional here, no matter what the current TypeScript DOM lib declares. On a browser that truly lacks it (like Safari or Firefox), this reads as undefined instead of throwing.
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
  // SAFETY: screen.isExtended is read as optional here, no matter what the current TypeScript DOM lib declares. On a browser that truly lacks it, this reads as false instead of throwing.
  Boolean((window.screen as ScreenWithIsExtended).isExtended);

/**
 * Casts `window.screen` so its `addEventListener`/`removeEventListener`
 * (used for the `change` event) become available. TypeScript's `Screen`
 * type doesn't declare them, but every browser's `screen` object supports
 * them as an `EventTarget`. This only ever runs on the client, as
 * `useSyncExternalStore`'s `subscribe`, so it needs no server guard — the
 * same as `subscribe` in `use-window-size.ts`, which calls
 * `window.addEventListener` directly.
 */
export const getScreenEventTarget = (): ScreenChangeEventTarget => {
  // SAFETY: window.screen is first cast to a shape where these methods are optional. This is safe because any object structurally matches an all-optional shape, whether or not the methods actually exist at runtime.
  const withOptionalEventTarget = window.screen as ScreenWithOptionalEventTarget;
  // SAFETY: every browser's `window.screen` supports `EventTarget` (including its `change` event), so it's safe to treat the optional methods above as always present. TypeScript's `Screen` type just doesn't declare them.
  return withOptionalEventTarget as ScreenChangeEventTarget;
};
