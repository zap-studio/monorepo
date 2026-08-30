import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useMousePosition } from "./use-mouse-position.ts";

describe("useMousePosition", () => {
  it("starts at all-0", () => {
    const { result } = renderHook(() => useMousePosition());

    expect(result.current).toEqual({
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      screenX: 0,
      screenY: 0,
    });
  });

  it("updates on mousemove", () => {
    const { result } = renderHook(() => useMousePosition());

    act(() => {
      window.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 10, clientY: 20, screenX: 100, screenY: 200 }),
      );
    });

    expect(result.current).toEqual({
      clientX: 10,
      clientY: 20,
      pageX: 10,
      pageY: 20,
      screenX: 100,
      screenY: 200,
    });
  });

  it("removes the listener on unmount", () => {
    const { result, unmount } = renderHook(() => useMousePosition());
    unmount();

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 5 }));
    });

    expect(result.current.clientX).toBe(0);
  });
});
