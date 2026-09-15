import { describe, expect, it, vi } from "vitest";

import { act, renderHook } from "../../tests/_react.ts";
import { useStorageEstimate } from "./use-storage-estimate.ts";

const setNavigatorStorage = (estimate: (() => Promise<StorageEstimate>) | undefined) => {
  Object.defineProperty(navigator, "storage", {
    configurable: true,
    value: estimate ? { estimate } : undefined,
  });
};

describe("useStorageEstimate", () => {
  it("starts unsupported: false but with usage/quota undefined while loading", async () => {
    setNavigatorStorage(() => new Promise(() => {}));

    const { result } = await renderHook(() => useStorageEstimate());

    expect(result.current).toEqual({ supported: true });
  });

  it("reports usage/quota once estimate resolves", async () => {
    setNavigatorStorage(() => Promise.resolve({ quota: 1_000_000, usage: 250_000 }));

    const { result } = await renderHook(() => useStorageEstimate());

    await vi.waitFor(() =>
      expect(result.current).toEqual({ quota: 1_000_000, supported: true, usage: 250_000 }),
    );
  });

  it("reports unsupported when navigator.storage.estimate is unavailable", async () => {
    setNavigatorStorage(undefined);

    const { result } = await renderHook(() => useStorageEstimate());

    expect(result.current).toEqual({ supported: false });
  });

  it("ignores a resolved estimate if the component unmounted first", async () => {
    let resolveEstimate!: (estimate: StorageEstimate) => void;
    const estimatePromise = new Promise<StorageEstimate>((resolve) => {
      resolveEstimate = resolve;
    });
    setNavigatorStorage(() => estimatePromise);

    const { result, unmount } = await renderHook(() => useStorageEstimate());
    await unmount();

    await act(async () => {
      resolveEstimate({ quota: 1, usage: 1 });
      await estimatePromise;
    });

    expect(result.current.usage).toBeUndefined();
  });

  it("does not call estimate a second time on re-render", async () => {
    const estimate = vi.fn<() => Promise<{ quota: number; usage: number }>>(() =>
      Promise.resolve({ quota: 1, usage: 1 }),
    );
    setNavigatorStorage(estimate);

    const { rerender } = await renderHook(() => useStorageEstimate());
    await vi.waitFor(() => expect(estimate).toHaveBeenCalledTimes(1));

    await rerender();

    expect(estimate).toHaveBeenCalledTimes(1);
  });
});
