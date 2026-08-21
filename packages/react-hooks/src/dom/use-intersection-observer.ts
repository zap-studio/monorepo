import { type RefObject, useEffect, useRef, useState } from "react";

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
 * (`root`/`rootMargin`/`threshold`). `inView` and `entry` start at `false`/
 * `undefined` — the SSR-safe default — until the first observation fires.
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
  optionsRef.current = options;
  const [entry, setEntry] = useState<IntersectionObserverEntry | undefined>(undefined);

  useEffect(() => {
    const element = ref.current;
    if (!isSupported() || !element) {
      return undefined;
    }

    const observer = new IntersectionObserver(([nextEntry]) => {
      setEntry(nextEntry);
    }, optionsRef.current);

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { entry, inView: entry?.isIntersecting ?? false, ref };
};

export { useIntersectionObserver as useInView };
