import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useScrollPosition } from "./use-scroll-position.ts";

const setScroll = (x: number, y: number) => {
  Object.defineProperty(window, "scrollX", { configurable: true, value: x });
  Object.defineProperty(window, "scrollY", { configurable: true, value: y });
};

afterEach(() => {
  setScroll(0, 0);
});

describe("useScrollPosition", () => {
  it("starts at { x: 0, y: 0 }", () => {
    const { result } = renderHook(() => useScrollPosition());

    expect(result.current).toEqual({ x: 0, y: 0 });
  });

  it("updates on the scroll event", () => {
    const { result } = renderHook(() => useScrollPosition());

    act(() => {
      setScroll(10, 20);
      window.dispatchEvent(new Event("scroll"));
    });

    expect(result.current).toEqual({ x: 10, y: 20 });
  });

  it("removes the listener on unmount", () => {
    const { result, unmount } = renderHook(() => useScrollPosition());
    unmount();

    act(() => {
      setScroll(10, 20);
      window.dispatchEvent(new Event("scroll"));
    });

    expect(result.current).toEqual({ x: 0, y: 0 });
  });
});
