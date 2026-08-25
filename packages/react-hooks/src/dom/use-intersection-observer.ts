import { type RefObject, useEffect, useRef, useState } from "react";

import { useIsomorphicLayoutEffect } from "../lifecycle/use-isomorphic-layout-effect.ts";

/** The shape returned by `useIntersectionObserver`. */
export interface UseIntersectionObserverResult<T extends Element> {
  entry: IntersectionObserverEntry | undefined;
  inView: boolean;
  ref: RefObject<T | null>;
}

const isSupported = (): boolean => typeof IntersectionObserver !== "undefined";

/**
 * Tracks whether the ref'd element is visible in the viewport (or a given
 * `root`), via `IntersectionObserver`. Attach `ref` to the element to
 * observe; `options` is passed straight through to the observer
 * (`root`/`rootMargin`/`threshold`) and doesn't need to be memoized — it is
 * compared field by field, and the observer is rebuilt when one changes.
 * `inView` and `entry` start at `false`/`undefined` — the SSR-safe default —
 * until the first observation fires.
 *
 * `ref` is re-read on every commit, so an element rendered conditionally,
 * mounted later, or swapped for another one is observed as soon as React
 * commits the change.
 *
 * Also exported as `useInView`, an alias for the same hook.
 *
 * @example
 * ```tsx
 * const { ref, inView } = useIntersectionObserver<HTMLDivElement>();
 * return <div ref={ref}>{inView ? "Visible" : "Off-screen"}</div>;
 * ```
 */
export const useIntersectionObserver = <T extends Element = HTMLElement>(
  options?: IntersectionObserverInit,
): UseIntersectionObserverResult<T> => {
  const ref = useRef<T | null>(null);
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });
  const [entry, setEntry] = useState<IntersectionObserverEntry | undefined>(undefined);

  const [element, setElement] = useState<T | null>(null);
  useIsomorphicLayoutEffect(() => {
    setElement(ref.current);
  });

  const { root, rootMargin, threshold } = options ?? {};
  const thresholdKey = Array.isArray(threshold) ? threshold.join(",") : threshold;

  useEffect(() => {
    if (!isSupported() || !element) {
      return undefined;
    }

    const observer = new IntersectionObserver(([nextEntry]) => {
      setEntry(nextEntry);
    }, optionsRef.current);

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, root, rootMargin, thresholdKey]);

  return { entry, inView: entry?.isIntersecting ?? false, ref };
};

export { useIntersectionObserver as useInView };
