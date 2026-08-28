import { type DependencyList, useEffect, useRef, useState } from "react";

import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.ts";

/** The shape returned by `useAsync`. */
export interface UseAsyncState<T> {
  data?: T;
  error?: Error;
  loading: boolean;
}

/**
 * Wraps a promise-returning function with `loading`, `error`, and `data`
 * state. Runs `asyncFn` again whenever `deps` changes. This works just
 * like `useEffect`'s dependency array — leave `deps` empty to run once on
 * mount. If `deps` changes (or the component unmounts) before `asyncFn`
 * finishes, the old result is ignored.
 *
 * `asyncFn` also follows `useEffect`'s closure rules: it only sees the
 * values from the last time `deps` changed. With the default `[]`, this
 * means `useAsync(() => fetchUser(id))` always uses the `id` from the
 * first render. Pass `[id]` if `id` can change.
 *
 * For a simple "fetch on mount or when the URL changes" case, you can
 * write `useAsync(() => fetch(url).then((r) => r.json()), [url])`. For
 * caching, revalidation, or request deduplication, use a library like
 * React Query or SWR instead.
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
  const asyncFnRef = useRef(asyncFn);
  useIsomorphicLayoutEffect(() => {
    asyncFnRef.current = asyncFn;
  });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true });

    const run = async () => {
      try {
        const data = await asyncFnRef.current();
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
  }, deps);

  return state;
};
