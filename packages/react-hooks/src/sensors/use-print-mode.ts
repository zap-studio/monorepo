import { useMediaQueryMatch } from "./_media-query.ts";

/**
 * `true` while the page is being printed (or previewed for print), via the
 * `print` media query — more reliable than the raw `beforeprint`/`afterprint`
 * events, which some browsers fire inconsistently around the print dialog.
 * `false` during server rendering and before the client subscribes.
 *
 * @example
 * ```tsx
 * const isPrinting = usePrintMode();
 * ```
 */
export const usePrintMode = (): boolean => useMediaQueryMatch("print");
