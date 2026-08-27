import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useTouchSupport } from "./use-touch-support.ts";

const setMaxTouchPoints = (value: number) => {
  Object.defineProperty(navigator, "maxTouchPoints", { configurable: true, value });
};

describe("useTouchSupport", () => {
  it("is true when maxTouchPoints is greater than 0", () => {
    setMaxTouchPoints(5);

    const { result, unmount } = renderHook(() => useTouchSupport());

    expect(result.current).toBe(true);
    unmount();
  });

  it("is false when maxTouchPoints is 0", () => {
    setMaxTouchPoints(0);

    const { result } = renderHook(() => useTouchSupport());

    expect(result.current).toBe(false);
  });
});
