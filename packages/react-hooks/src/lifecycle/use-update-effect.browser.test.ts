import { describe, expect, it, vi } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { useUpdateEffect } from "./use-update-effect.ts";

describe("useUpdateEffect", () => {
  it("does not call the effect on the mount render", async () => {
    const effect = vi.fn<() => void>();
    await renderHook(() => useUpdateEffect(effect, []));

    expect(effect).not.toHaveBeenCalled();
  });

  it("calls the effect on subsequent renders when a dependency changes", async () => {
    const effect = vi.fn<() => void>();
    const { rerender } = await renderHook(({ value }) => useUpdateEffect(effect, [value]), {
      initialProps: { value: 1 },
    });

    await rerender({ value: 2 });

    expect(effect).toHaveBeenCalledTimes(1);
  });

  it("does not call the effect again when dependencies stay the same", async () => {
    const effect = vi.fn<() => void>();
    const { rerender } = await renderHook(({ value }) => useUpdateEffect(effect, [value]), {
      initialProps: { value: 1 },
    });

    await rerender({ value: 1 });

    expect(effect).not.toHaveBeenCalled();
  });

  it("runs the effect's own cleanup between updates", async () => {
    const cleanup = vi.fn<() => void>();
    const effect = vi.fn<() => () => void>(() => cleanup);
    const { rerender, unmount } = await renderHook(
      ({ value }) => useUpdateEffect(effect, [value]),
      {
        initialProps: { value: 1 },
      },
    );

    await rerender({ value: 2 });
    expect(cleanup).not.toHaveBeenCalled();

    await rerender({ value: 3 });
    expect(cleanup).toHaveBeenCalledTimes(1);

    await unmount();
    expect(cleanup).toHaveBeenCalledTimes(2);
  });
});
