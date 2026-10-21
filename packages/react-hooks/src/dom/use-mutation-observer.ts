import { type RefObject, useEffect, useRef, useState } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";

const DEFAULT_OPTIONS: MutationObserverInit = {
  attributes: true,
  characterData: true,
  childList: true,
  subtree: true,
};

/**
 * Watches for DOM changes inside the ref'd element, using
 * `MutationObserver`. Attach `ref` to the element you want to watch.
 *
 * By default it watches attribute changes, text changes, and changes
 * anywhere inside the element's children. Pass `options` to change this.
 *
 * You don't need to memoize `callback` or `options`. The hook always
 * calls the latest `callback`, and it compares `options` field by field,
 * rebuilding the observer only when something actually changes.
 *
 * The hook checks `ref` again after every render, so it still works if
 * the element appears later, is conditionally rendered, or gets replaced.
 *
 * @example
 * ```tsx
 * const ref = useMutationObserver<HTMLDivElement>((mutations) => console.log(mutations));
 * return <div ref={ref}>{children}</div>;
 * ```
 */
export const useMutationObserver = <T extends Element = HTMLElement>(
  callback: (mutations: MutationRecord[]) => void,
  options: MutationObserverInit = DEFAULT_OPTIONS,
): RefObject<T | null> => {
  const ref = useRef<T | null>(null);
  const callbackRef = useRef(callback);
  const optionsRef = useRef(options);
  useEffect(() => {
    callbackRef.current = callback;
    optionsRef.current = options;
  });

  const [element, setElement] = useState<T | null>(null);
  useIsomorphicLayoutEffect(() => {
    setElement(ref.current);
  });

  const {
    attributeFilter,
    attributeOldValue,
    attributes,
    characterData,
    characterDataOldValue,
    childList,
    subtree,
  } = options;
  const attributeFilterKey = attributeFilter?.join(",");

  useEffect(() => {
    if (typeof MutationObserver === "undefined" || !element) {
      return undefined;
    }

    const observer = new MutationObserver((mutations) => callbackRef.current(mutations));
    observer.observe(element, optionsRef.current);
    return () => observer.disconnect();
  }, [
    element,
    attributeFilterKey,
    attributeOldValue,
    attributes,
    characterData,
    characterDataOldValue,
    childList,
    subtree,
  ]);

  return ref;
};
