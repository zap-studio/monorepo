import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useStorageEstimate } from "./use-storage-estimate.ts";

function setNavigatorStorage(estimate: (() => Promise<StorageEstimate>) | undefined) {
  Object.defineProperty(navigator, "storage", {
    configurable: true,
    value: estimate ? { estimate } : undefined,
  });
}

describe(useStorageEstimate, () => {
  it("starts unsupported: false but with usage/quota undefined while loading", () => {
    setNavigatorStorage(() => new Promise(() => {}));

    const { result } = renderHook(() => useStorageEstimate());

    expect(result.current).toEqual({ quota: undefined, supported: true, usage: undefined });
  });

  it("reports usage/quota once estimate resolves", async () => {
    setNavigatorStorage(() => Promise.resolve({ quota: 1_000_000, usage: 250_000 }));

    const { result } = renderHook(() => useStorageEstimate());

    await waitFor(() =>
      expect(result.current).toEqual({ quota: 1_000_000, supported: true, usage: 250_000 }),
    );
  });

  it("reports unsupported when navigator.storage.estimate is unavailable", () => {
    setNavigatorStorage(undefined);

    const { result } = renderHook(() => useStorageEstimate());

    expect(result.current).toEqual({ quota: undefined, supported: false, usage: undefined });
  });

  it("ignores a resolved estimate if the component unmounted first", async () => {
    let resolveEstimate!: (estimate: StorageEstimate) => void;
    const estimatePromise = new Promise<StorageEstimate>((resolve) => {
      resolveEstimate = resolve;
    });
    setNavigatorStorage(() => estimatePromise);

    const { result, unmount } = renderHook(() => useStorageEstimate());
    unmount();

    await act(async () => {
      resolveEstimate({ quota: 1, usage: 1 });
      await estimatePromise;
    });

    expect(result.current.usage).toBeUndefined();
  });

  it("does not call estimate a second time on re-render", async () => {
    const estimate = vi.fn(() => Promise.resolve({ quota: 1, usage: 1 }));
    setNavigatorStorage(estimate);

    const { rerender } = renderHook(() => useStorageEstimate());
    await waitFor(() => expect(estimate).toHaveBeenCalledTimes(1));

    rerender();

    expect(estimate).toHaveBeenCalledTimes(1);
  });
});
