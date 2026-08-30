import { renderHook } from "@testing-library/react";
import { type RefObject, useRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { useEventListener } from "./use-event-listener.ts";

describe("useEventListener", () => {
  it("attaches to window by default target and calls the handler", () => {
    const handler = vi.fn<(event: Event) => void>();
    renderHook(() => useEventListener(window, "click", handler));

    window.dispatchEvent(new Event("click"));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("attaches to a ref'd element", () => {
    const handler = vi.fn<(event: Event) => void>();
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
    const first = vi.fn<() => void>();
    const second = vi.fn<() => void>();

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
    const handler = vi.fn<(event: Event) => void>();
    const { unmount } = renderHook(() => useEventListener(window, "click", handler));

    unmount();
    window.dispatchEvent(new Event("click"));

    expect(handler).not.toHaveBeenCalled();
  });

  it("unmounts cleanly when nothing was ever attached", () => {
    const { unmount } = renderHook(() => useEventListener(undefined, "click", () => {}));

    expect(() => unmount()).not.toThrow();
  });

  it("re-subscribes when type changes", () => {
    const handler = vi.fn<(event: Event) => void>();
    const { rerender } = renderHook(
      ({ type }: { type: string }) => useEventListener(window, type, handler),
      { initialProps: { type: "click" } },
    );

    rerender({ type: "keydown" });
    window.dispatchEvent(new Event("click"));
    window.dispatchEvent(new Event("keydown"));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("attaches to an element the ref only points at after the first render", () => {
    const handler = vi.fn<(event: Event) => void>();
    const element = document.createElement("div");
    const ref: RefObject<HTMLDivElement | null> = { current: null };

    const { rerender } = renderHook(() => useEventListener(ref, "click", handler));

    element.dispatchEvent(new Event("click"));
    expect(handler).not.toHaveBeenCalled();

    ref.current = element;
    rerender();
    element.dispatchEvent(new Event("click"));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("moves the listener when the ref points at a different element", () => {
    const handler = vi.fn<(event: Event) => void>();
    const first = document.createElement("div");
    const second = document.createElement("div");
    const ref: RefObject<HTMLDivElement | null> = { current: first };

    const { rerender } = renderHook(() => useEventListener(ref, "click", handler));

    ref.current = second;
    rerender();

    first.dispatchEvent(new Event("click"));
    expect(handler).not.toHaveBeenCalled();

    second.dispatchEvent(new Event("click"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("detaches when the ref's element goes away", () => {
    const handler = vi.fn<(event: Event) => void>();
    const element = document.createElement("div");
    const ref: RefObject<HTMLDivElement | null> = { current: element };

    const { rerender } = renderHook(() => useEventListener(ref, "click", handler));

    ref.current = null;
    rerender();
    element.dispatchEvent(new Event("click"));

    expect(handler).not.toHaveBeenCalled();
  });

  it("does not re-subscribe for an options object re-created on every render", () => {
    const addEventListener = vi.spyOn(window, "addEventListener");
    const { rerender } = renderHook(() =>
      useEventListener(window, "click", () => {}, { capture: true, passive: true }),
    );

    const initialCalls = addEventListener.mock.calls.length;
    rerender();
    rerender();

    expect(addEventListener.mock.calls).toHaveLength(initialCalls);
  });

  it("re-subscribes when a boolean capture option flips", () => {
    const handler = vi.fn<(event: Event) => void>();
    const addEventListener = vi.spyOn(window, "addEventListener");

    const { rerender } = renderHook(
      ({ capture }: { capture: boolean }) => useEventListener(window, "click", handler, capture),
      { initialProps: { capture: false } },
    );

    const initialCalls = addEventListener.mock.calls.length;
    rerender({ capture: true });

    expect(addEventListener.mock.calls).toHaveLength(initialCalls + 1);

    window.dispatchEvent(new Event("click"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("re-subscribes when the once option changes", () => {
    const addEventListener = vi.spyOn(window, "addEventListener");

    const { rerender } = renderHook(
      ({ once }: { once: boolean }) => useEventListener(window, "click", () => {}, { once }),
      { initialProps: { once: false } },
    );

    const initialCalls = addEventListener.mock.calls.length;
    rerender({ once: true });

    expect(addEventListener.mock.calls).toHaveLength(initialCalls + 1);
  });

  it("only calls the handler once with the once option", () => {
    const handler = vi.fn<(event: Event) => void>();
    renderHook(() => useEventListener(window, "click", handler, { once: true }));

    window.dispatchEvent(new Event("click"));
    window.dispatchEvent(new Event("click"));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("re-subscribes when the passive option changes", () => {
    const addEventListener = vi.spyOn(window, "addEventListener");

    const { rerender } = renderHook(
      ({ passive }: { passive: boolean }) =>
        useEventListener(window, "click", () => {}, { passive }),
      { initialProps: { passive: true } },
    );

    const initialCalls = addEventListener.mock.calls.length;
    rerender({ passive: false });

    expect(addEventListener.mock.calls).toHaveLength(initialCalls + 1);
  });

  it("forwards an abort signal and re-subscribes when it changes", () => {
    const handler = vi.fn<(event: Event) => void>();
    const first = new AbortController();
    const second = new AbortController();

    const { rerender } = renderHook(
      ({ signal }: { signal: AbortSignal }) =>
        useEventListener(window, "click", handler, { signal }),
      { initialProps: { signal: first.signal } },
    );

    rerender({ signal: second.signal });
    first.abort();
    window.dispatchEvent(new Event("click"));

    expect(handler).toHaveBeenCalledTimes(1);

    second.abort();
    window.dispatchEvent(new Event("click"));

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
