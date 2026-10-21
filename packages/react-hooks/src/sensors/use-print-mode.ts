import { useMediaQueryMatch } from "./_media-query.ts";

/**
 * `true` while the page is being printed (or shown in print preview). It
 * uses the `print` media query. This is more reliable than the
 * `beforeprint`/`afterprint` events, because some browsers fire those
 * events at the wrong time. `false` during server rendering and before
 * the client connects.
 *
 * @example
 * ```tsx
 * const isPrinting = usePrintMode();
 * ```
 */
export const usePrintMode = (): boolean => useMediaQueryMatch("print");
