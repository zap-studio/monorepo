import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { asTestDouble } from "../../tests/_test-double.ts";
import { useNavigationType } from "./use-navigation-type.ts";

describe("useNavigationType", () => {
  it("reads the type off the navigation timing entry", () => {
    vi.spyOn(performance, "getEntriesByType").mockImplementation((type: string) =>
      type === "navigation"
        ? [asTestDouble<PerformanceNavigationTiming>({ entryType: "navigation", type: "reload" })]
        : [],
    );

    const { result } = renderHook(() => useNavigationType());

    expect(result.current).toBe("reload");
  });

  it('falls back to "navigate" when there is no navigation timing entry', () => {
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([]);

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
