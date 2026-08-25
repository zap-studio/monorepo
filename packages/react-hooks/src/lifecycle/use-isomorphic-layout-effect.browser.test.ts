import { renderHook } from "@testing-library/react";
import { useLayoutEffect } from "react";
import { describe, expect, it, vi } from "vitest";

import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.ts";

describe("useIsomorphicLayoutEffect", () => {
  it("is useLayoutEffect in the browser", () => {
    expect(useIsomorphicLayoutEffect).toBe(useLayoutEffect);
  });

  it("runs the effect on mount and its cleanup on unmount", () => {
    const cleanup = vi.fn();
    const effect = vi.fn(() => cleanup);

    const { unmount } = renderHook(() => {
      useIsomorphicLayoutEffect(effect, []);
    });

    expect(effect).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();

    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("re-runs when its dependencies change", () => {
    const effect = vi.fn();

    const { rerender } = renderHook(
      ({ value }: { value: number }) => {
        useIsomorphicLayoutEffect(effect, [value]);
      },
      { initialProps: { value: 1 } },
    );

    rerender({ value: 1 });
    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ value: 2 });
    expect(effect).toHaveBeenCalledTimes(2);
  });
});
