import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useRenderDuration } from "./use-render-duration.ts";

describe(useRenderDuration, () => {
  it("starts with no samples", () => {
    const { result } = renderHook(() => useRenderDuration());

    expect(result.current.samples).toEqual([]);
    expect(result.current.last).toBeNull();
  });

  it("accumulates a sample on each onRender call", () => {
    const { result } = renderHook(() => useRenderDuration());

    act(() => {
      result.current.onRender("Sidebar", "mount", 5, 4, 100, 105);
    });

    expect(result.current.samples).toHaveLength(1);
    expect(result.current.last).toEqual({
      actualDuration: 5,
      baseDuration: 4,
      commitTime: 105,
      id: "Sidebar",
      phase: "mount",
      startTime: 100,
    });

    act(() => {
      result.current.onRender("Sidebar", "update", 2, 2, 200, 202);
    });

    expect(result.current.samples).toHaveLength(2);
    expect(result.current.last?.phase).toBe("update");
  });

  it("caps samples at the given limit", () => {
    const { result } = renderHook(() => useRenderDuration(2));

    act(() => {
      result.current.onRender("A", "mount", 1, 1, 0, 1);
    });
    act(() => {
      result.current.onRender("A", "update", 2, 2, 1, 3);
    });
    act(() => {
      result.current.onRender("A", "update", 3, 3, 3, 6);
    });

    expect(result.current.samples).toHaveLength(2);
    expect(result.current.samples.map((sample) => sample.actualDuration)).toEqual([2, 3]);
  });
});
