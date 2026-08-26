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
 * Tracks whether the ref'd element is visible on screen (or inside a
 * given `root` element), using `IntersectionObserver`. Attach `ref` to
 * the element you want to watch.
 *
 * `options` (`root`/`rootMargin`/`threshold`) is passed straight to the
 * observer. You don't need to memoize it — the hook compares its fields
 * itself and only rebuilds the observer when one of them changes.
 *
 * `inView` starts as `false` and `entry` starts as `undefined`. This is
 * also the safe default for server-side rendering. Both update once the
 * first observation happens.
 *
 * The hook checks `ref` again after every render, so it still works if
 * the element appears later, is conditionally rendered, or gets replaced.
 *
 * Also exported as `useInView`, which is the same hook under another name.
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
