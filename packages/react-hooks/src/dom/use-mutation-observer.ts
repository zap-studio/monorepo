import { type RefObject, useEffect, useRef } from "react";

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
 * `options` overrides that. `callback` doesn't need to be memoized — the
 * latest one is always called.
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
  callbackRef.current = callback;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const element = ref.current;
    if (typeof MutationObserver === "undefined" || !element) {
      return undefined;
    }

    const observer = new MutationObserver((mutations) => callbackRef.current(mutations));
    observer.observe(element, optionsRef.current);
    return () => observer.disconnect();
  }, []);

  return ref;
};
