import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useUpdateEffect } from "./use-update-effect.ts";

describe(useUpdateEffect, () => {
  it("does not call the effect on the mount render", () => {
    const effect = vi.fn();
    renderHook(() => useUpdateEffect(effect, []));

    expect(effect).not.toHaveBeenCalled();
  });

  it("calls the effect on subsequent renders when a dependency changes", () => {
    const effect = vi.fn();
    const { rerender } = renderHook(({ value }) => useUpdateEffect(effect, [value]), {
      initialProps: { value: 1 },
    });

    rerender({ value: 2 });

    expect(effect).toHaveBeenCalledTimes(1);
  });

  it("does not call the effect again when dependencies stay the same", () => {
    const effect = vi.fn();
    const { rerender } = renderHook(({ value }) => useUpdateEffect(effect, [value]), {
      initialProps: { value: 1 },
    });

    rerender({ value: 1 });

    expect(effect).not.toHaveBeenCalled();
  });

  it("runs the effect's own cleanup between updates", () => {
    const cleanup = vi.fn();
    const effect = vi.fn(() => cleanup);
    const { rerender, unmount } = renderHook(({ value }) => useUpdateEffect(effect, [value]), {
      initialProps: { value: 1 },
    });

    rerender({ value: 2 });
    expect(cleanup).not.toHaveBeenCalled();

    rerender({ value: 3 });
    expect(cleanup).toHaveBeenCalledTimes(1);

    unmount();
    expect(cleanup).toHaveBeenCalledTimes(2);
  });
});
