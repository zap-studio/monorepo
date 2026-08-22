import { type DependencyList, useEffect, useState } from "react";

/** The shape returned by `useAsync`. */
export interface UseAsyncState<T> {
  data?: T;
  error?: Error;
  loading: boolean;
}

/**
 * Wraps a promise-returning function with `loading`/`error`/`data` state.
 * Re-runs `asyncFn` whenever `deps` changes (forwarded verbatim to the
 * underlying effect, so it follows the exact same rules as `useEffect`'s
 * dependency array — omit it to run once on mount). A stale run's
 * resolution is ignored if `deps` changes (or the component unmounts)
 * before it settles.
 *
 * `useAsync(() => fetch(url).then((r) => r.json()), [url])` covers the
 * common "fetch on mount/when url changes" case — a separate `useFetch`
 * would be a near-duplicate, and real fetch ergonomics (caching,
 * revalidation, request dedup) are React Query/SWR's job, not this
 * package's.
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useAsync(() => fetchUser(id), [id]);
 * ```
 */
export const useAsync = <T>(
  asyncFn: () => Promise<T>,
  deps: DependencyList = [],
): UseAsyncState<T> => {
  const [state, setState] = useState<UseAsyncState<T>>({ loading: true });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true });

    const run = async () => {
      try {
        const data = await asyncFn();
        if (!cancelled) {
          setState({ data, loading: false });
        }
      } catch (caught) {
        if (!cancelled) {
          setState({
            error: caught instanceof Error ? caught : new Error(String(caught)),
            loading: false,
          });
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- deps is forwarded verbatim from the caller, mirroring useEffect's own contract; asyncFn is deliberately excluded so consumers never have to memoize it.
  }, deps);

  return state;
};
