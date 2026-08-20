import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useUnmount } from "./use-unmount.ts";

describe(useUnmount, () => {
  it("does not call the cleanup while mounted", () => {
    const cleanup = vi.fn();
    renderHook(() => useUnmount(cleanup));

    expect(cleanup).not.toHaveBeenCalled();
  });

  it("calls the cleanup once on unmount", () => {
    const cleanup = vi.fn();
    const { unmount } = renderHook(() => useUnmount(cleanup));

    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("calls the latest cleanup, not a stale one from an earlier render", () => {
    const firstCleanup = vi.fn();
    const secondCleanup = vi.fn();
    const { rerender, unmount } = renderHook(({ cleanup }) => useUnmount(cleanup), {
      initialProps: { cleanup: firstCleanup },
    });

    rerender({ cleanup: secondCleanup });
    unmount();

    expect(firstCleanup).not.toHaveBeenCalled();
    expect(secondCleanup).toHaveBeenCalledTimes(1);
  });
});
