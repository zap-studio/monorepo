import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useUnstableIsFirstRender } from "./use-unstable-is-first-render.ts";

describe(useUnstableIsFirstRender, () => {
  it("is true on mount, then false on every later render", () => {
    const { rerender, result } = renderHook(() => useUnstableIsFirstRender());

    expect(result.current).toBe(true);

    rerender();
    expect(result.current).toBe(false);

    rerender();
    expect(result.current).toBe(false);
  });
});
