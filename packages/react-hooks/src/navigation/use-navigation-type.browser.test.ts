import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useNavigationType } from "./use-navigation-type.ts";

// SAFETY: one place to cast test doubles and fake fixtures to a type they do not
// fully match. This keeps `as unknown as X` chains out of the test body.
const asTestDouble = <T>(value: unknown): T => value as T;

const originalGetEntriesByType = performance.getEntriesByType.bind(performance);

afterEach(() => {
  performance.getEntriesByType = originalGetEntriesByType;
});

describe("useNavigationType", () => {
  it("reads the type off the navigation timing entry", () => {
    // SAFETY: readNavigationType only reads `.entryType` and `.type` off the first item returned by getEntriesByType("navigation"), so a fake entry with just those two fields is enough. The outer cast only matches this stand-in function's simpler signature to the real type of performance.getEntriesByType.
    performance.getEntriesByType = ((type: string) =>
      type === "navigation"
        ? [asTestDouble<PerformanceNavigationTiming>({ entryType: "navigation", type: "reload" })]
        : []) as typeof performance.getEntriesByType;

    const { result } = renderHook(() => useNavigationType());

    expect(result.current).toBe("reload");
  });

  it('falls back to "navigate" when there is no navigation timing entry', () => {
    // SAFETY: readNavigationType only calls getEntriesByType("navigation") and reads the first item, so a function with no arguments that returns an empty array tests the "no entry" fallback. It does not need the real multi-argument signature.
    performance.getEntriesByType = (() => []) as typeof performance.getEntriesByType;

    const { result } = renderHook(() => useNavigationType());

    expect(result.current).toBe("navigate");
  });

  it('falls back to "navigate" when the Navigation Timing API is unsupported', () => {
    Object.defineProperty(performance, "getEntriesByType", {
      configurable: true,
      value: null,
    });

    const { result } = renderHook(() => useNavigationType());

    expect(result.current).toBe("navigate");
  });
});
