import { useCallback, useEffect, useRef, useState } from "react";

/** The shape returned by `useMap`. */
export interface UseMapResult<K, V> {
  clear: () => void;
  delete: (key: K) => void;
  get: (key: K) => V | undefined;
  has: (key: K) => boolean;
  map: ReadonlyMap<K, V>;
  set: (key: K, value: V) => void;
}

/**
 * State backed by a `Map`. `set()`, `delete()`, and `clear()` each create
 * a new `Map`, so React re-renders every time you change it — a plain
 * mutable `Map` wouldn't trigger a re-render when you call `.set()` on
 * it. `get()` and `has()` always read the latest map, so they never
 * return stale data.
 *
 * @example
 * ```tsx
 * const { map, set, delete: del } = useMap<string, number>();
 * set("a", 1);
 * ```
 */
export const useMap = <K, V>(initialEntries?: Iterable<readonly [K, V]>): UseMapResult<K, V> => {
  const [map, setMap] = useState<Map<K, V>>(() => new Map(initialEntries));
  const mapRef = useRef(map);
  useEffect(() => {
    mapRef.current = map;
  });

  const set = useCallback((key: K, value: V) => {
    const next = new Map(mapRef.current);
    next.set(key, value);
    mapRef.current = next;
    setMap(next);
  }, []);

  const deleteKey = useCallback((key: K) => {
    if (!mapRef.current.has(key)) {
      return;
    }
    const next = new Map(mapRef.current);
    next.delete(key);
    mapRef.current = next;
    setMap(next);
  }, []);

  const clear = useCallback(() => {
    if (mapRef.current.size === 0) {
      return;
    }
    const next = new Map<K, V>();
    mapRef.current = next;
    setMap(next);
  }, []);

  const get = useCallback((key: K): V | undefined => mapRef.current.get(key), []);
  const has = useCallback((key: K): boolean => mapRef.current.has(key), []);

  return { clear, delete: deleteKey, get, has, map, set };
};
