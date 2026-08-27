import { type RefObject, useCallback, useEffect, useRef, useState } from "react";

import { useTrackedRefElement } from "../lifecycle/_tracked-ref-element.ts";

/** The shape returned by `usePopover`. */
export interface UsePopoverResult<T extends HTMLElement> {
  hide: () => void;
  isOpen: boolean;
  ref: RefObject<T | null>;
  show: () => void;
  supported: boolean;
  toggle: () => void;
}

const isSupported = (): boolean =>
  typeof HTMLElement !== "undefined" && typeof HTMLElement.prototype.togglePopover === "function";

/**
 * Wraps the browser's built-in Popover API for a single ref'd element.
 * Attach `ref` to the element that has the `popover` attribute, then call
 * `show()`, `hide()`, or `toggle()` to control it.
 *
 * `isOpen` tracks whether the popover is open by listening to its own
 * `toggle` event. This keeps `isOpen` correct even when the browser
 * closes the popover on its own (for example, clicking outside it or
 * pressing Esc). `supported` is `false` on browsers without this API, and
 * also as the safe default during server-side rendering.
 *
 * The hook checks `ref` again after every render. This matters for
 * popovers used in menus, which are often only rendered while open — the
 * hook still picks them up right away, instead of leaving `isOpen` stuck
 * at `false`.
 *
 * @example
 * ```tsx
 * const { ref, isOpen, toggle } = usePopover<HTMLDivElement>();
 * return <>
 *   <button onClick={toggle}>Menu</button>
 *   <div ref={ref} popover="auto">{isOpen ? "Open" : "Closed"}</div>
 * </>;
 * ```
 */
export const usePopover = <T extends HTMLElement = HTMLElement>(): UsePopoverResult<T> => {
  const supported = isSupported();
  const ref = useRef<T | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const show = useCallback((): void => {
    ref.current?.showPopover();
  }, []);

  const hide = useCallback((): void => {
    ref.current?.hidePopover();
  }, []);

  const toggle = useCallback((): void => {
    ref.current?.togglePopover();
  }, []);

  const element = useTrackedRefElement(ref);

  useEffect(() => {
    if (!isSupported() || !element) {
      return undefined;
    }

    const handleToggle = (event: Event) => {
      // SAFETY: TypeScript types "toggle" as the generic Event, but this element only ever sends a ToggleEvent for it.
      setIsOpen((event as ToggleEvent).newState === "open");
    };

    element.addEventListener("toggle", handleToggle);
    return () => element.removeEventListener("toggle", handleToggle);
  }, [element]);

  return { hide, isOpen, ref, show, supported, toggle };
};
