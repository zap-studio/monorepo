import { useLayoutEffect } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.ts";

describe("useIsomorphicLayoutEffect", () => {
  it("is useLayoutEffect in the browser", () => {
    expect(useIsomorphicLayoutEffect).toBe(useLayoutEffect);
  });

  it("runs the effect on mount and its cleanup on unmount", async () => {
    const cleanup = vi.fn<() => void>();
    const effect = vi.fn<() => () => void>(() => cleanup);

    const { unmount } = await renderHook(() => {
      useIsomorphicLayoutEffect(effect, []);
    });

    expect(effect).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();

    await unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("re-runs when its dependencies change", async () => {
    const effect = vi.fn<() => void>();

    const { rerender } = await renderHook(
      ({ value }: { value: number }) => {
        useIsomorphicLayoutEffect(effect, [value]);
      },
      { initialProps: { value: 1 } },
    );

    await rerender({ value: 1 });
    expect(effect).toHaveBeenCalledTimes(1);

    await rerender({ value: 2 });
    expect(effect).toHaveBeenCalledTimes(2);
  });
});
