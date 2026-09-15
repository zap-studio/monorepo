import { afterEach, describe, expect, it } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useScrollPosition } from "./use-scroll-position.ts";

const setScroll = (x: number, y: number) => {
  Object.defineProperty(window, "scrollX", { configurable: true, value: x });
  Object.defineProperty(window, "scrollY", { configurable: true, value: y });
};

afterEach(() => {
  setScroll(0, 0);
});

describe("useScrollPosition", () => {
  it("starts at { x: 0, y: 0 }", async () => {
    const { result } = await renderHook(() => useScrollPosition());

    expect(result.current).toEqual({ x: 0, y: 0 });
  });

  it("updates on the scroll event", async () => {
    const { result } = await renderHook(() => useScrollPosition());

    await act(() => {
      setScroll(10, 20);
      window.dispatchEvent(new Event("scroll"));
    });

    expect(result.current).toEqual({ x: 10, y: 20 });
  });

  it("removes the listener on unmount", async () => {
    const { result, unmount } = await renderHook(() => useScrollPosition());
    await unmount();

    await act(() => {
      setScroll(10, 20);
      window.dispatchEvent(new Event("scroll"));
    });

    expect(result.current).toEqual({ x: 0, y: 0 });
  });
});
