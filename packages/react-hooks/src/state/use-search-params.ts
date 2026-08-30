import { useCallback, useEffect, useState } from "react";

import { isUpdaterFunction } from "./_updater.ts";

/** Anything `new URLSearchParams()` itself accepts. */
export type SearchParamsInit = ConstructorParameters<typeof URLSearchParams>[0];

/** Options accepted by `useSearchParams`'s setter. */
export interface SetSearchParamsOptions {
  replace?: boolean;
}

/** The setter returned by `useSearchParams`. */
export type SetSearchParams = (
  next: SearchParamsInit | ((prev: URLSearchParams) => SearchParamsInit),
  options?: SetSearchParamsOptions,
) => void;

const readSearchParams = (): URLSearchParams => new URLSearchParams(location.search);

const buildUrl = (params: URLSearchParams): string => {
  const query = params.size > 0 ? `?${params.toString()}` : "";
  return `${location.pathname}${query}${location.hash}`;
};

/**
 * State synced to the URL's query string. Reads `location.search` and
 * updates when the user goes back or forward (the `popstate` event). The
 * setter calls `history.pushState`/`replaceState`, which don't fire
 * `popstate`, so the setter also updates the local state directly instead
 * of waiting for an event. Pass `{ replace: true }` to replace the
 * current history entry instead of adding a new one. Falls back to empty
 * params during server rendering.
 *
 * @example
 * ```tsx
 * const [searchParams, setSearchParams] = useSearchParams();
 * const page = searchParams.get("page") ?? "1";
 * setSearchParams((prev) => new URLSearchParams({ ...Object.fromEntries(prev), page: "2" }));
 * ```
 */
export const useSearchParams = (): [URLSearchParams, SetSearchParams] => {
  const [searchParams, setSearchParamsState] = useState<URLSearchParams>(() =>
    typeof window === "undefined" ? new URLSearchParams() : readSearchParams(),
  );

  useEffect(() => {
    const handlePopState = () => setSearchParamsState(readSearchParams());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const setSearchParams = useCallback<SetSearchParams>(
    (next, options) => {
      const resolvedInit = isUpdaterFunction(next) ? next(searchParams) : next;
      const nextParams = new URLSearchParams(resolvedInit);
      const url = buildUrl(nextParams);
      if (options?.replace) {
        history.replaceState(history.state, "", url);
      } else {
        history.pushState(history.state, "", url);
      }
      setSearchParamsState(nextParams);
    },
    [searchParams],
  );

  return [searchParams, setSearchParams];
};
