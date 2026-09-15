import { describe, expect, it } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { useTouchSupport } from "./use-touch-support.ts";

const setMaxTouchPoints = (value: number) => {
  Object.defineProperty(navigator, "maxTouchPoints", { configurable: true, value });
};

describe("useTouchSupport", () => {
  it("is true when maxTouchPoints is greater than 0", async () => {
    setMaxTouchPoints(5);

    const { result, unmount } = await renderHook(() => useTouchSupport());

    expect(result.current).toBe(true);
    await unmount();
  });

  it("is false when maxTouchPoints is 0", async () => {
    setMaxTouchPoints(0);

    const { result } = await renderHook(() => useTouchSupport());

    expect(result.current).toBe(false);
  });
});
