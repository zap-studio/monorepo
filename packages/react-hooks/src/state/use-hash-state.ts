import { useCallback, useEffect, useRef, useState } from "react";

/** The setter returned by `useHashState`. */
export type SetHash = (next: string | ((prev: string) => string)) => void;

const readHash = (): string => location.hash;

/**
 * State synced to `location.hash`, updating on the native `hashchange`
 * event — including when `setHash()` itself writes `location.hash`, since
 * that assignment synchronously fires `hashchange` too (unlike
 * `history.pushState`/`replaceState`, which stay silent — see
 * `useSearchParams` for that case). Falls back to `""` during server
 * rendering and before the client subscribes.
 *
 * @example
 * ```tsx
 * const [hash, setHash] = useHashState();
 * setHash("#section-2");
 * ```
 */
export const useHashState = (): [string, SetHash] => {
  const [hash, setHashState] = useState<string>(() =>
    typeof window === "undefined" ? "" : readHash(),
  );
  const hashRef = useRef(hash);
  hashRef.current = hash;

  useEffect(() => {
    const handleHashChange = () => setHashState(readHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const setHash = useCallback<SetHash>((next) => {
    const resolved = typeof next === "function" ? next(hashRef.current) : next;
    location.hash = resolved;
  }, []);

  return [hash, setHash];
};
