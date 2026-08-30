import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useMount } from "./use-mount.ts";

describe("useMount", () => {
  it("calls the effect once on mount", () => {
    const effect = vi.fn<() => void>();
    renderHook(() => useMount(effect));

    expect(effect).toHaveBeenCalledTimes(1);
  });

  it("does not call the effect again on re-render", () => {
    const effect = vi.fn<() => void>();
    const { rerender } = renderHook(() => useMount(effect));

    rerender();
    rerender();

    expect(effect).toHaveBeenCalledTimes(1);
  });
});
