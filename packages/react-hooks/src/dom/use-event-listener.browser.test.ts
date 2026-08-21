import { renderHook } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { useEventListener } from "./use-event-listener.ts";

describe(useEventListener, () => {
  it("attaches to window by default target and calls the handler", () => {
    const handler = vi.fn();
    renderHook(() => useEventListener(window, "click", handler));

    window.dispatchEvent(new Event("click"));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("attaches to a ref'd element", () => {
    const handler = vi.fn();
    const element = document.createElement("div");

    renderHook(() => {
      const ref = useRef<HTMLDivElement>(element);
      useEventListener(ref, "click", handler);
    });

    element.dispatchEvent(new Event("click"));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does nothing when target is null/undefined", () => {
    expect(() => {
      renderHook(() => useEventListener(undefined, "click", () => {}));
    }).not.toThrow();
  });

  it("calls the latest handler without re-subscribing", () => {
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = renderHook(
      ({ handler }: { handler: () => void }) => useEventListener(window, "click", handler),
      { initialProps: { handler: first } },
    );

    rerender({ handler: second });
    window.dispatchEvent(new Event("click"));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("removes the listener on unmount", () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useEventListener(window, "click", handler));

    unmount();
    window.dispatchEvent(new Event("click"));

    expect(handler).not.toHaveBeenCalled();
  });

  it("re-subscribes when type changes", () => {
    const handler = vi.fn();
    const { rerender } = renderHook(
      ({ type }: { type: string }) => useEventListener(window, type, handler),
      { initialProps: { type: "click" } },
    );

    rerender({ type: "keydown" });
    window.dispatchEvent(new Event("click"));
    window.dispatchEvent(new Event("keydown"));

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
