import { type RefObject, useEffect, useRef, useState } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";

const DEFAULT_OPTIONS: MutationObserverInit = {
  attributes: true,
  characterData: true,
  childList: true,
  subtree: true,
};

/**
 * Observes DOM mutations on the ref'd element/subtree via
 * `MutationObserver`. Attach `ref` to the element to observe. Defaults to
 * watching attributes, character data, and the full child subtree;
 * `options` overrides that. Neither `callback` nor `options` needs to be
 * memoized — the latest `callback` is always called, and `options` is
 * compared field by field, with the observer rebuilt when one changes.
 *
 * `ref` is re-read on every commit, so a subtree rendered conditionally,
 * mounted later, or swapped for another one is observed as soon as React
 * commits the change.
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
