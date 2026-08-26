import { render, renderHook } from "@testing-library/react";
import { createElement, StrictMode } from "react";
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

describe("useIsFirstRender under StrictMode", () => {
  it("is true on both passes of the double-invoked mount render", () => {
    const seen: boolean[] = [];
    function TestComponent() {
      seen.push(useIsFirstRender());
      return null;
    }
    render(createElement(StrictMode, null, createElement(TestComponent)));

    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every(Boolean)).toBe(true);
  });
});
