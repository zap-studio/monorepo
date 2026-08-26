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

/** `window.screen` with its `EventTarget` methods as optional — the intermediate shape for the cast below, since `Screen` and `EventTarget` don't otherwise overlap. */
interface ScreenWithOptionalEventTarget {
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
}

/** `window.screen`'s `EventTarget` methods (its `change` event), which this TypeScript DOM lib's `Screen` interface doesn't declare — every browser that ships `screen` implements it as an `EventTarget`, so these are always present. */
export interface ScreenChangeEventTarget {
  addEventListener: (type: "change", listener: () => void) => void;
  removeEventListener: (type: "change", listener: () => void) => void;
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
 * `"window-management"` permission. Only ever called client-side, as
 * `useSyncExternalStore`'s `getSnapshot` — no server guard needed, same as
 * `use-window-size.ts`'s `getSnapshot` reading `window.innerWidth` directly.
 */
export const getIsExtended = (): boolean =>
  // SAFETY: screen.isExtended is read as optional here regardless of how (or whether) the resolved TypeScript version's DOM lib declares it, so a browser where it's genuinely absent degrades to false rather than throwing.
  Boolean((window.screen as ScreenWithIsExtended).isExtended);

/**
 * `window.screen` cast to expose its `addEventListener`/`removeEventListener`
 * (the `change` event) as optional members, since this TypeScript DOM lib's
 * `Screen` doesn't declare them — every browser that ships `screen`
 * implements it as an `EventTarget`. Only ever called client-side, as
 * `useSyncExternalStore`'s `subscribe` — no server guard needed, same as
 * `use-window-size.ts`'s `subscribe` calling `window.addEventListener` directly.
 */
export const getScreenEventTarget = (): ScreenChangeEventTarget => {
  // SAFETY: window.screen is cast to an all-optional interface first, so this narrows nothing TypeScript couldn't already prove — Screen structurally satisfies any all-optional shape regardless of whether addEventListener/removeEventListener actually exist at runtime.
  const withOptionalEventTarget = window.screen as ScreenWithOptionalEventTarget;
  // SAFETY: every browser that ships `window.screen` implements it as an `EventTarget` (dispatching its `change` event), so the optional members above are narrowed to required here — this TypeScript DOM lib's `Screen` just doesn't declare them.
  return withOptionalEventTarget as ScreenChangeEventTarget;
};
