import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useIsFirstRender } from "./use-is-first-render.ts";

describe(useIsFirstRender, () => {
  it("is true on mount, then false on every later render", () => {
    const { rerender, result } = renderHook(() => useIsFirstRender());

    expect(result.current).toBe(true);

    rerender();
    expect(result.current).toBe(false);

    rerender();
    expect(result.current).toBe(false);
  });
});
