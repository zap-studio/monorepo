import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useUnstableRenderCount } from "./use-unstable-render-count.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe(useUnstableRenderCount, () => {
  it("starts at 1 and increments on each render", () => {
    const { rerender, result } = renderHook(() => useUnstableRenderCount());

    expect(result.current).toBe(1);

    rerender();
    expect(result.current).toBe(2);

    rerender();
    expect(result.current).toBe(3);
  });

  it("still counts normally when process is entirely undefined", () => {
    vi.stubGlobal("process", undefined);

    const { result } = renderHook(() => useUnstableRenderCount());

    expect(result.current).toBe(1);
  });
});
