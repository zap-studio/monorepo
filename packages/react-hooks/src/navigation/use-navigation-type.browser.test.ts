import { describe, expect, it, vi } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { asTestDouble } from "../../tests/_test-double.ts";
import { useNavigationType } from "./use-navigation-type.ts";

describe("useNavigationType", () => {
  it("reads the type off the navigation timing entry", async () => {
    vi.spyOn(performance, "getEntriesByType").mockImplementation((type: string) =>
      type === "navigation"
        ? [asTestDouble<PerformanceNavigationTiming>({ entryType: "navigation", type: "reload" })]
        : [],
    );

    const { result } = await renderHook(() => useNavigationType());

    expect(result.current).toBe("reload");
  });

  it('falls back to "navigate" when there is no navigation timing entry', async () => {
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([]);

    const { result } = await renderHook(() => useNavigationType());

    expect(result.current).toBe("navigate");
  });

  it('falls back to "navigate" when the Navigation Timing API is unsupported', async () => {
    Object.defineProperty(performance, "getEntriesByType", {
      configurable: true,
      value: null,
    });

    const { result } = await renderHook(() => useNavigationType());

    expect(result.current).toBe("navigate");
  });
});
