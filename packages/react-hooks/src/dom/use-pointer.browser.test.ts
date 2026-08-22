import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { usePointer } from "./use-pointer.ts";

describe(usePointer, () => {
  it("starts with the all-empty/false initial state", () => {
    const { result } = renderHook(() => usePointer());

    expect(result.current).toEqual({
      clientX: 0,
      clientY: 0,
      isDown: false,
      pointerType: "",
      pressure: 0,
    });
  });

  it("updates and sets isDown: true on pointerdown", () => {
    const { result } = renderHook(() => usePointer());

    act(() => {
      window.dispatchEvent(
        new PointerEvent("pointerdown", { clientX: 5, clientY: 6, pointerType: "touch" }),
      );
    });

    expect(result.current.isDown).toBe(true);
    expect(result.current.clientX).toBe(5);
    expect(result.current.pointerType).toBe("touch");
  });

  it("updates position on pointermove without changing isDown", () => {
    const { result } = renderHook(() => usePointer());

    act(() => {
      window.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "mouse" }));
    });
    expect(result.current.isDown).toBe(true);

    act(() => {
      window.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 10, clientY: 20, pointerType: "mouse" }),
      );
    });

    expect(result.current.isDown).toBe(true);
    expect(result.current.clientX).toBe(10);
  });

  it("sets isDown: false on pointerup", () => {
    const { result } = renderHook(() => usePointer());

    act(() => {
      window.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "mouse" }));
    });
    act(() => {
      window.dispatchEvent(new PointerEvent("pointerup", { pointerType: "mouse" }));
    });

    expect(result.current.isDown).toBe(false);
  });

  it("removes listeners on unmount", () => {
    const { result, unmount } = renderHook(() => usePointer());
    unmount();

    act(() => {
      window.dispatchEvent(new PointerEvent("pointerdown", { pointerType: "mouse" }));
    });

    expect(result.current.isDown).toBe(false);
  });
});
