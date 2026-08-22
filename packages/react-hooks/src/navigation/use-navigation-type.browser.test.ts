import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useNavigationType } from "./use-navigation-type.ts";

const originalGetEntriesByType = performance.getEntriesByType.bind(performance);

afterEach(() => {
  performance.getEntriesByType = originalGetEntriesByType;
});

describe(useNavigationType, () => {
  it("reads the type off the navigation timing entry", () => {
    performance.getEntriesByType = ((type: string) =>
      type === "navigation"
        ? [{ type: "reload" } as unknown as PerformanceNavigationTiming]
        : []) as typeof performance.getEntriesByType;

    const { result } = renderHook(() => useNavigationType());

    expect(result.current).toBe("reload");
  });

  it('falls back to "navigate" when there is no navigation timing entry', () => {
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
