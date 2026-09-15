import { describe, expect, it, vi } from "vitest";

import { renderHook } from "../../tests/_react.ts";
import { useMount } from "./use-mount.ts";

describe("useMount", () => {
  it("calls the effect once on mount", async () => {
    const effect = vi.fn<() => void>();
    await renderHook(() => useMount(effect));

    expect(effect).toHaveBeenCalledTimes(1);
  });

  it("does not call the effect again on re-render", async () => {
    const effect = vi.fn<() => void>();
    const { rerender } = await renderHook(() => useMount(effect));

    await rerender();
    await rerender();

    expect(effect).toHaveBeenCalledTimes(1);
  });
});
