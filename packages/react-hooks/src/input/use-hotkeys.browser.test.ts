import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useHotkeys } from "./use-hotkeys.ts";

const dispatchKeyDown = (init: KeyboardEventInit) => {
  return window.dispatchEvent(new KeyboardEvent("keydown", { cancelable: true, ...init }));
};

describe("useHotkeys", () => {
  it("calls the handler when a plain key combo matches", async () => {
    const handler = vi.fn<() => void>();
    renderHook(() => useHotkeys({ enter: handler }));

    await act(async () => {
      dispatchKeyDown({ key: "Enter" });
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("calls the handler when a modifier combo matches exactly", async () => {
    const handler = vi.fn<() => void>();
    renderHook(() => useHotkeys({ "ctrl+s": handler }));

    await act(async () => {
      dispatchKeyDown({ ctrlKey: true, key: "s" });
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not call the handler when only the key matches but not the modifiers", async () => {
    const handler = vi.fn<() => void>();
    renderHook(() => useHotkeys({ "ctrl+s": handler }));

    await act(async () => {
      dispatchKeyDown({ key: "s" });
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("matches combos case-insensitively", async () => {
    const handler = vi.fn<() => void>();
    renderHook(() => useHotkeys({ "Ctrl+S": handler }));

    await act(async () => {
      dispatchKeyDown({ ctrlKey: true, key: "S" });
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("calls preventDefault when the preventDefault option is set", async () => {
    const handler = vi.fn<() => void>();
    renderHook(() => useHotkeys({ "ctrl+s": handler }, { preventDefault: true }));

    let prevented = true;
    await act(async () => {
      prevented = dispatchKeyDown({ ctrlKey: true, key: "s" });
    });

    expect(prevented).toBe(false);
  });

  it("does not call preventDefault by default", async () => {
    const handler = vi.fn<() => void>();
    renderHook(() => useHotkeys({ "ctrl+s": handler }));

    let prevented = true;
    await act(async () => {
      prevented = dispatchKeyDown({ ctrlKey: true, key: "s" });
    });

    expect(prevented).toBe(true);
  });

  it("does not attach listeners when enabled: false", async () => {
    const handler = vi.fn<() => void>();
    renderHook(() => useHotkeys({ "ctrl+s": handler }, { enabled: false }));

    await act(async () => {
      dispatchKeyDown({ ctrlKey: true, key: "s" });
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("always calls the latest bindings without re-subscribing", async () => {
    const firstHandler = vi.fn<() => void>();
    const secondHandler = vi.fn<() => void>();
    const { rerender } = renderHook(({ handler }) => useHotkeys({ "ctrl+s": handler }), {
      initialProps: { handler: firstHandler },
    });

    rerender({ handler: secondHandler });

    await act(async () => {
      dispatchKeyDown({ ctrlKey: true, key: "s" });
    });

    expect(firstHandler).not.toHaveBeenCalled();
    expect(secondHandler).toHaveBeenCalledTimes(1);
  });

  it("ignores a combo string with no key part", async () => {
    const handler = vi.fn<() => void>();
    renderHook(() => useHotkeys({ "": handler }));

    await act(async () => {
      dispatchKeyDown({ key: "a" });
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("removes the listener on unmount", async () => {
    const handler = vi.fn<() => void>();
    const { unmount } = renderHook(() => useHotkeys({ "ctrl+s": handler }));
    unmount();

    await act(async () => {
      dispatchKeyDown({ ctrlKey: true, key: "s" });
    });

    expect(handler).not.toHaveBeenCalled();
  });
});
