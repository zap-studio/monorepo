import { type RefObject, useCallback, useEffect, useRef, useState } from "react";

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
 * Wraps the native Popover API (2024+ baseline) for a single ref'd
 * element — attach `ref` to the element carrying the `popover` attribute,
 * then call `show()`/`hide()`/`toggle()` imperatively. `isOpen` tracks the
 * element's open state via its own `toggle` event, so it also stays in
 * sync when the browser closes the popover itself (light-dismiss, Esc).
 * `supported: false` — the SSR-safe default — where the API doesn't exist.
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

  useEffect(() => {
    const element = ref.current;
    if (!isSupported() || !element) {
      return undefined;
    }

    const handleToggle = (event: Event) => {
      // SAFETY: addEventListener types "toggle" as the generic Event, but the popover element only ever dispatches ToggleEvent for it.
      setIsOpen((event as ToggleEvent).newState === "open");
    };

    element.addEventListener("toggle", handleToggle);
    return () => element.removeEventListener("toggle", handleToggle);
  }, []);

  return { hide, isOpen, ref, show, supported, toggle };
};
