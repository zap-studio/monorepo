import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useNavigationType } from "./use-navigation-type.ts";

const originalGetEntriesByType = performance.getEntriesByType.bind(performance);

afterEach(() => {
  performance.getEntriesByType = originalGetEntriesByType;
});

describe("useNavigationType", () => {
  it("reads the type off the navigation timing entry", () => {
    // SAFETY: readNavigationType only reads `.type` off the first element returned by getEntriesByType("navigation"), so a fake entry with just a `type` field satisfies the hook's actual usage; the outer cast only matches this stand-in function's simpler signature to performance.getEntriesByType's real type.
    performance.getEntriesByType = ((type: string) =>
      type === "navigation"
        ? [{ type: "reload" } as unknown as PerformanceNavigationTiming]
        : []) as typeof performance.getEntriesByType;

    const { result } = renderHook(() => useNavigationType());

    expect(result.current).toBe("reload");
  });

  it('falls back to "navigate" when there is no navigation timing entry', () => {
    // SAFETY: readNavigationType only calls getEntriesByType("navigation") and destructures the first element, so a zero-arg function returning an empty array exercises the "no entry" fallback branch without needing the real multi-argument signature.
    performance.getEntriesByType = (() => []) as typeof performance.getEntriesByType;

    const { result } = renderHook(() => useNavigationType());

    expect(result.current).toBe("navigate");
  });

  it('falls back to "navigate" when the Navigation Timing API is unsupported', () => {
    Object.defineProperty(performance, "getEntriesByType", {
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useNavigationType());

    expect(result.current).toBe("navigate");
  });
});
