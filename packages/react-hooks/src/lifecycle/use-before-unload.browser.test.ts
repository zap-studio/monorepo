import { describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useBeforeUnload } from "./use-before-unload.ts";

describe("useBeforeUnload", () => {
  it("calls the handler when beforeunload fires", async () => {
    const handler = vi.fn<(event: BeforeUnloadEvent) => void>();
    await renderHook(() => useBeforeUnload(handler));

    await act(async () => {
      window.dispatchEvent(new Event("beforeunload", { cancelable: true }));
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not attach a listener when enabled: false", async () => {
    const handler = vi.fn<(event: BeforeUnloadEvent) => void>();
    await renderHook(() => useBeforeUnload(handler, false));

    await act(async () => {
      window.dispatchEvent(new Event("beforeunload", { cancelable: true }));
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("always calls the latest handler without re-subscribing", async () => {
    const firstHandler = vi.fn<(event: BeforeUnloadEvent) => void>();
    const secondHandler = vi.fn<(event: BeforeUnloadEvent) => void>();
    const { rerender } = await renderHook(({ handler }) => useBeforeUnload(handler), {
      initialProps: { handler: firstHandler },
    });

    await rerender({ handler: secondHandler });
    await act(async () => {
      window.dispatchEvent(new Event("beforeunload", { cancelable: true }));
    });

    expect(firstHandler).not.toHaveBeenCalled();
    expect(secondHandler).toHaveBeenCalledTimes(1);
  });

  it("removes the listener on unmount", async () => {
    const handler = vi.fn<(event: BeforeUnloadEvent) => void>();
    const { unmount } = await renderHook(() => useBeforeUnload(handler));
    await unmount();

    await act(async () => {
      window.dispatchEvent(new Event("beforeunload", { cancelable: true }));
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("removes and re-adds the listener when enabled toggles", async () => {
    const handler = vi.fn<(event: BeforeUnloadEvent) => void>();
    const { rerender } = await renderHook(({ enabled }) => useBeforeUnload(handler, enabled), {
      initialProps: { enabled: false },
    });

    await rerender({ enabled: true });
    await act(async () => {
      window.dispatchEvent(new Event("beforeunload", { cancelable: true }));
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
