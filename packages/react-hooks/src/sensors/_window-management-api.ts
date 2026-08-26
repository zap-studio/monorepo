/** Minimal local model of the Window Management API — Experimental per MDN, not declared in every TypeScript DOM lib. */

/** One connected display, as reported by `getScreenDetails()` — extends the standard `Screen` with placement and identity fields. */
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

/** The `getScreenDetails()` result — every connected display, live-updated as they change. */
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

/** `window.screen`'s `EventTarget` methods (its `change` event), which this TypeScript DOM lib's `Screen` interface doesn't declare. */
interface ScreenChangeEventTarget {
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
}

/**
 * Guards `typeof window === "undefined"` because `useExperimentalWindowManagement`
 * reads this synchronously in the hook body, on every render including SSR —
 * not just from an effect.
 */
export const getScreenDetailsFn = (): GetScreenDetails | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // SAFETY: window.getScreenDetails is read as optional here regardless of how (or whether) the resolved TypeScript version's DOM lib declares it, so a browser where it's genuinely absent (Safari, Firefox) degrades to undefined rather than throwing.
  return (window as WindowWithScreenDetails).getScreenDetails;
};

/**
 * `window.screen.isExtended` — `true` once more than one display is
 * available to the device — readable without prompting for the
 * `"window-management"` permission. `false` during server rendering and
 * where the property doesn't exist.
 */
export const getIsExtended = (): boolean => {
  if (typeof window === "undefined" || !window.screen) {
    return false;
  }
  // SAFETY: screen.isExtended is read as optional here regardless of how (or whether) the resolved TypeScript version's DOM lib declares it, so a browser where it's genuinely absent degrades to false rather than throwing.
  return Boolean((window.screen as ScreenWithIsExtended).isExtended);
};

/**
 * `undefined` during server rendering. `window.screen` cast to expose its
 * `addEventListener`/`removeEventListener` (the `change` event) as optional
 * members, since this TypeScript DOM lib's `Screen` doesn't declare them —
 * every browser that ships `screen` implements it as an `EventTarget`.
 */
export const getScreenEventTarget = (): ScreenChangeEventTarget | undefined => {
  if (typeof window === "undefined" || !window.screen) {
    return undefined;
  }
  // SAFETY: window.screen is cast to an all-optional interface, so this narrows nothing TypeScript couldn't already prove — Screen structurally satisfies it regardless of whether addEventListener/removeEventListener actually exist at runtime.
  return window.screen as ScreenChangeEventTarget;
};
