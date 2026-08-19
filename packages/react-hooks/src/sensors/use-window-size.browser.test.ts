import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useWindowSize } from "./use-window-size.ts";

function setWindowSize(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
}

describe(useWindowSize, () => {
  it("reports the current window size", () => {
    setWindowSize(1024, 768);

    const { result } = renderHook(() => useWindowSize());

    expect(result.current).toEqual({ height: 768, width: 1024 });
  });

  it("updates when the window is resized", async () => {
    setWindowSize(1024, 768);
    const { result } = renderHook(() => useWindowSize());
    expect(result.current).toEqual({ height: 768, width: 1024 });

    await act(async () => {
      setWindowSize(500, 400);
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toEqual({ height: 400, width: 500 });
  });
});
