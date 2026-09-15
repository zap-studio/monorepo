import { describe, expect, it } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useMousePosition } from "./use-mouse-position.ts";

describe("useMousePosition", () => {
  it("starts at all-0", async () => {
    const { result } = await renderHook(() => useMousePosition());

    expect(result.current).toEqual({
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      screenX: 0,
      screenY: 0,
    });
  });

  it("updates on mousemove", async () => {
    const { result } = await renderHook(() => useMousePosition());

    await act(() => {
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

  it("removes the listener on unmount", async () => {
    const { result, unmount } = await renderHook(() => useMousePosition());
    await unmount();

    await act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 5 }));
    });

    expect(result.current.clientX).toBe(0);
  });
});
