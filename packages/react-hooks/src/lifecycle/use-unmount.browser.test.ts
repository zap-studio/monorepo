import { describe, expect, it, vi } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { useUnmount } from "./use-unmount.ts";

describe("useUnmount", () => {
  it("does not call the cleanup while mounted", async () => {
    const cleanup = vi.fn<() => void>();
    await renderHook(() => useUnmount(cleanup));

    expect(cleanup).not.toHaveBeenCalled();
  });

  it("calls the cleanup once on unmount", async () => {
    const cleanup = vi.fn<() => void>();
    const { unmount } = await renderHook(() => useUnmount(cleanup));

    await unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("calls the latest cleanup, not a stale one from an earlier render", async () => {
    const firstCleanup = vi.fn<() => void>();
    const secondCleanup = vi.fn<() => void>();
    const { rerender, unmount } = await renderHook(({ cleanup }) => useUnmount(cleanup), {
      initialProps: { cleanup: firstCleanup },
    });

    await rerender({ cleanup: secondCleanup });
    await unmount();

    expect(firstCleanup).not.toHaveBeenCalled();
    expect(secondCleanup).toHaveBeenCalledTimes(1);
  });
});
