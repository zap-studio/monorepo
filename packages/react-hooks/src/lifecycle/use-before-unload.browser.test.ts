import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useBeforeUnload } from "./use-before-unload.ts";

describe(useBeforeUnload, () => {
  it("calls the handler when beforeunload fires", async () => {
    const handler = vi.fn();
    renderHook(() => useBeforeUnload(handler));

    await act(async () => {
      window.dispatchEvent(new Event("beforeunload", { cancelable: true }));
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not attach a listener when enabled: false", async () => {
    const handler = vi.fn();
    renderHook(() => useBeforeUnload(handler, false));

    await act(async () => {
      window.dispatchEvent(new Event("beforeunload", { cancelable: true }));
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("always calls the latest handler without re-subscribing", async () => {
    const firstHandler = vi.fn();
    const secondHandler = vi.fn();
    const { rerender } = renderHook(({ handler }) => useBeforeUnload(handler), {
      initialProps: { handler: firstHandler },
    });

    rerender({ handler: secondHandler });
    await act(async () => {
      window.dispatchEvent(new Event("beforeunload", { cancelable: true }));
    });

    expect(firstHandler).not.toHaveBeenCalled();
    expect(secondHandler).toHaveBeenCalledTimes(1);
  });

  it("removes the listener on unmount", async () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useBeforeUnload(handler));
    unmount();

    await act(async () => {
      window.dispatchEvent(new Event("beforeunload", { cancelable: true }));
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("removes and re-adds the listener when enabled toggles", async () => {
    const handler = vi.fn();
    const { rerender } = renderHook(({ enabled }) => useBeforeUnload(handler, enabled), {
      initialProps: { enabled: false },
    });

    rerender({ enabled: true });
    await act(async () => {
      window.dispatchEvent(new Event("beforeunload", { cancelable: true }));
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
