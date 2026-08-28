import { useSyncExternalStore } from "react";

/** Rendering engine identified by `useBrowserEngine`. */
export type BrowserEngine = "blink" | "gecko" | "unknown" | "webkit";

interface NavigatorWithUserAgentData extends Navigator {
  readonly userAgentData?: unknown;
}

const subscribe = () => () => {};

const detectEngine = (): BrowserEngine => {
  // SAFETY: userAgentData (User-Agent Client Hints) is a Chromium-only API that TypeScript's DOM types don't include. Its mere presence, not its contents, is what identifies Blink here.
  if ((navigator as NavigatorWithUserAgentData).userAgentData) {
    return "blink";
  }
  // Blink is ruled out above, so -moz- support left standing means Firefox.
  if (CSS.supports("(-moz-appearance: none)")) {
    return "gecko";
  }
  // Blink and Gecko are ruled out above, so remaining -webkit- support means Safari/WebKit.
  if (CSS.supports("(-webkit-hyphens: none)")) {
    return "webkit";
  }
  return "unknown";
};

const getSnapshot = (): BrowserEngine => detectEngine();

const getServerSnapshot = (): BrowserEngine => "unknown";

/**
 * Identifies the browser's rendering engine — `"blink"` (Chrome, Edge,
 * Opera, and other Chromium browsers), `"gecko"` (Firefox), or `"webkit"`
 * (Safari) — using feature detection instead of parsing
 * `navigator.userAgent`, per MDN's guidance against user-agent sniffing.
 * This is a best-effort heuristic for the rare cross-engine quirks that
 * no single feature check covers — for example, only Safari requires a
 * `requestPermission()` gesture before `useDeviceOrientation`/
 * `useDeviceMotion` report values. Prefer detecting the specific feature
 * or API you need over branching on the engine when you can.
 * `"unknown"` is also the safe default for server rendering.
 *
 * @example
 * ```tsx
 * const engine = useBrowserEngine();
 * const { requestPermission } = useDeviceOrientation();
 *
 * return engine === "webkit" ? (
 *   <button onClick={requestPermission}>Enable tilt controls</button>
 * ) : null;
 * ```
 */
export const useBrowserEngine = (): BrowserEngine =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
