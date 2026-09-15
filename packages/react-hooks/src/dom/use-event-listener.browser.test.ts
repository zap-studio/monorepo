import { type RefObject, useRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { useEventListener } from "./use-event-listener.ts";

describe("useEventListener", () => {
  it("attaches to window by default target and calls the handler", async () => {
    const handler = vi.fn<(event: Event) => void>();
    await renderHook(() => useEventListener(window, "click", handler));

    window.dispatchEvent(new Event("click"));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("attaches to a ref'd element", async () => {
    const handler = vi.fn<(event: Event) => void>();
    const element = document.createElement("div");

    await renderHook(() => {
      const ref = useRef<HTMLDivElement>(element);
      useEventListener(ref, "click", handler);
    });

    element.dispatchEvent(new Event("click"));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does nothing when target is null/undefined", () => {
    expect(async () => {
      await renderHook(() => useEventListener(undefined, "click", () => {}));
    }).not.toThrow();
  });

  it("calls the latest handler without re-subscribing", async () => {
    const first = vi.fn<() => void>();
    const second = vi.fn<() => void>();

    const { rerender } = await renderHook(
      ({ handler }: { handler: () => void }) => useEventListener(window, "click", handler),
      { initialProps: { handler: first } },
    );

    await rerender({ handler: second });
    window.dispatchEvent(new Event("click"));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("removes the listener on unmount", async () => {
    const handler = vi.fn<(event: Event) => void>();
    const { unmount } = await renderHook(() => useEventListener(window, "click", handler));

    await unmount();
    window.dispatchEvent(new Event("click"));

    expect(handler).not.toHaveBeenCalled();
  });

  it("unmounts cleanly when nothing was ever attached", async () => {
    const { unmount } = await renderHook(() => useEventListener(undefined, "click", () => {}));

    expect(async () => await unmount()).not.toThrow();
  });

  it("re-subscribes when type changes", async () => {
    const handler = vi.fn<(event: Event) => void>();
    const { rerender } = await renderHook(
      ({ type }: { type: string }) => useEventListener(window, type, handler),
      { initialProps: { type: "click" } },
    );

    await rerender({ type: "keydown" });
    window.dispatchEvent(new Event("click"));
    window.dispatchEvent(new Event("keydown"));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("attaches to an element the ref only points at after the first render", async () => {
    const handler = vi.fn<(event: Event) => void>();
    const element = document.createElement("div");
    const ref: RefObject<HTMLDivElement | null> = { current: null };

    const { rerender } = await renderHook(() => useEventListener(ref, "click", handler));

    element.dispatchEvent(new Event("click"));
    expect(handler).not.toHaveBeenCalled();

    ref.current = element;
    await rerender();
    element.dispatchEvent(new Event("click"));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("moves the listener when the ref points at a different element", async () => {
    const handler = vi.fn<(event: Event) => void>();
    const first = document.createElement("div");
    const second = document.createElement("div");
    const ref: RefObject<HTMLDivElement | null> = { current: first };

    const { rerender } = await renderHook(() => useEventListener(ref, "click", handler));

    ref.current = second;
    await rerender();

    first.dispatchEvent(new Event("click"));
    expect(handler).not.toHaveBeenCalled();

    second.dispatchEvent(new Event("click"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("detaches when the ref's element goes away", async () => {
    const handler = vi.fn<(event: Event) => void>();
    const element = document.createElement("div");
    const ref: RefObject<HTMLDivElement | null> = { current: element };

    const { rerender } = await renderHook(() => useEventListener(ref, "click", handler));

    ref.current = null;
    await rerender();
    element.dispatchEvent(new Event("click"));

    expect(handler).not.toHaveBeenCalled();
  });

  it("does not re-subscribe for an options object re-created on every render", async () => {
    const addEventListener = vi.spyOn(window, "addEventListener");
    const { rerender } = await renderHook(() =>
      useEventListener(window, "click", () => {}, { capture: true, passive: true }),
    );

    const initialCalls = addEventListener.mock.calls.length;
    await rerender();
    await rerender();

    expect(addEventListener.mock.calls).toHaveLength(initialCalls);
  });

  it("re-subscribes when a boolean capture option flips", async () => {
    const handler = vi.fn<(event: Event) => void>();
    const addEventListener = vi.spyOn(window, "addEventListener");

    const { rerender } = await renderHook(
      ({ capture }: { capture: boolean }) => useEventListener(window, "click", handler, capture),
      { initialProps: { capture: false } },
    );

    const initialCalls = addEventListener.mock.calls.length;
    await rerender({ capture: true });

    expect(addEventListener.mock.calls).toHaveLength(initialCalls + 1);

    window.dispatchEvent(new Event("click"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("re-subscribes when the once option changes", async () => {
    const addEventListener = vi.spyOn(window, "addEventListener");

    const { rerender } = await renderHook(
      ({ once }: { once: boolean }) => useEventListener(window, "click", () => {}, { once }),
      { initialProps: { once: false } },
    );

    const initialCalls = addEventListener.mock.calls.length;
    await rerender({ once: true });

    expect(addEventListener.mock.calls).toHaveLength(initialCalls + 1);
  });

  it("only calls the handler once with the once option", async () => {
    const handler = vi.fn<(event: Event) => void>();
    await renderHook(() => useEventListener(window, "click", handler, { once: true }));

    window.dispatchEvent(new Event("click"));
    window.dispatchEvent(new Event("click"));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("re-subscribes when the passive option changes", async () => {
    const addEventListener = vi.spyOn(window, "addEventListener");

    const { rerender } = await renderHook(
      ({ passive }: { passive: boolean }) =>
        useEventListener(window, "click", () => {}, { passive }),
      { initialProps: { passive: true } },
    );

    const initialCalls = addEventListener.mock.calls.length;
    await rerender({ passive: false });

    expect(addEventListener.mock.calls).toHaveLength(initialCalls + 1);
  });

  it("forwards an abort signal and re-subscribes when it changes", async () => {
    const handler = vi.fn<(event: Event) => void>();
    const first = new AbortController();
    const second = new AbortController();

    const { rerender } = await renderHook(
      ({ signal }: { signal: AbortSignal }) =>
        useEventListener(window, "click", handler, { signal }),
      { initialProps: { signal: first.signal } },
    );

    await rerender({ signal: second.signal });
    first.abort();
    window.dispatchEvent(new Event("click"));

    expect(handler).toHaveBeenCalledTimes(1);

    second.abort();
    window.dispatchEvent(new Event("click"));

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
