import { useCallback, useEffect, useRef, useState } from "react";

/** The shape returned by `useSet`. */
export interface UseSetResult<T> {
  add: (value: T) => void;
  clear: () => void;
  delete: (value: T) => void;
  has: (value: T) => boolean;
  set: ReadonlySet<T>;
}

/**
 * State backed by a `Set`. `add()`, `delete()`, and `clear()` each create
 * a new `Set`, so React re-renders every time you change it — a plain
 * mutable `Set` wouldn't trigger a re-render when you call `.add()` on
 * it. `has()` always reads the latest set, so it never returns stale
 * data.
 *
 * @example
 * ```tsx
 * const { set, add, has } = useSet<string>();
 * add("a");
 * ```
 */
export const useSet = <T>(initialValues?: Iterable<T>): UseSetResult<T> => {
  const [set, setSet] = useState<Set<T>>(() => new Set(initialValues));
  const setRef = useRef(set);
  useEffect(() => {
    setRef.current = set;
  });

  const add = useCallback((value: T) => {
    if (setRef.current.has(value)) {
      return;
    }
    const next = new Set(setRef.current);
    next.add(value);
    setRef.current = next;
    setSet(next);
  }, []);

  const deleteValue = useCallback((value: T) => {
    if (!setRef.current.has(value)) {
      return;
    }
    const next = new Set(setRef.current);
    next.delete(value);
    setRef.current = next;
    setSet(next);
  }, []);

  const clear = useCallback(() => {
    if (setRef.current.size === 0) {
      return;
    }
    const next = new Set<T>();
    setRef.current = next;
    setSet(next);
  }, []);

  const has = useCallback((value: T): boolean => setRef.current.has(value), []);

  return { add, clear, delete: deleteValue, has, set };
};
