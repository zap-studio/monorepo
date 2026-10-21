import { useCallback, useEffect, useRef, useState } from "react";

/** The setter returned by `useHashState`. */
export type SetHash = (next: string | ((prev: string) => string)) => void;

const readHash = (): string => location.hash;

/**
 * State that stays in sync with `location.hash`. It updates on the
 * browser's `hashchange` event, including when `setHash()` changes
 * `location.hash` itself, since that change fires `hashchange` right
 * away too. This is different from `history.pushState`/`replaceState`,
 * which don't fire any event — see `useSearchParams` for that case. The
 * value is `""` during server rendering and until the hook connects on
 * the client.
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
  useEffect(() => {
    hashRef.current = hash;
  });

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
