import { describe, expect, it } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { usePointer } from "./use-pointer.ts";

describe("usePointer", () => {
  it("starts with the all-empty/false initial state", async () => {
    const { result } = await renderHook(() => usePointer());

    expect(result.current).toEqual({
      clientX: 0,
      clientY: 0,
      isDown: false,
      pointerType: "",
      pressure: 0,
    });
  });

  it("updates and sets isDown: true on pointerdown", async () => {
    const { result } = await renderHook(() => usePointer());

    await act(() => {
      window.dispatchEvent(
        new PointerEvent("pointerdown", { clientX: 5, clientY: 6, pointerType: "touch" }),
      );
    });

    expect(result.current.isDown).toBe(true);
    expect(result.current.clientX).toBe(5);
    expect(result.current.pointerType).toBe("touch");
  });

  it("updates position on pointermove without changing isDown", async () => {
    const { result } = await renderHook(() => usePointer());

    await act(() => {
      window.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "mouse" }));
    });
    expect(result.current.isDown).toBe(true);

    await act(() => {
      window.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 10, clientY: 20, pointerType: "mouse" }),
      );
    });

    expect(result.current.isDown).toBe(true);
    expect(result.current.clientX).toBe(10);
  });

  it("sets isDown: false on pointerup", async () => {
    const { result } = await renderHook(() => usePointer());

    await act(() => {
      window.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "mouse" }));
    });
    await act(() => {
      window.dispatchEvent(new PointerEvent("pointerup", { pointerType: "mouse" }));
    });

    expect(result.current.isDown).toBe(false);
  });

  it("removes listeners on unmount", async () => {
    const { result, unmount } = await renderHook(() => usePointer());
    await unmount();

    await act(() => {
      window.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "mouse" }));
    });

    expect(result.current.isDown).toBe(false);
  });
});
