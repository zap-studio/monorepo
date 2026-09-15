import { afterEach, describe, expect, it, vi } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { useRenderCount } from "./use-render-count.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useRenderCount", () => {
  it("starts at 1 and increments on each render", async () => {
    const { rerender, result } = await renderHook(() => useRenderCount());

    expect(result.current).toBe(1);

    await rerender();
    expect(result.current).toBe(2);

    await rerender();
    expect(result.current).toBe(3);
  });

  it("still counts normally when process is entirely undefined", async () => {
    vi.stubGlobal("process", undefined);

    const { result } = await renderHook(() => useRenderCount());

    expect(result.current).toBe(1);
  });
});
