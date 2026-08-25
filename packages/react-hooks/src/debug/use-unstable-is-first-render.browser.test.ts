import { render, renderHook } from "@testing-library/react";
import { createElement, StrictMode } from "react";
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

describe("useUnstableIsFirstRender under StrictMode", () => {
  it("is true on both passes of the double-invoked mount render", () => {
    const seen: boolean[] = [];
    function TestComponent() {
      seen.push(useUnstableIsFirstRender());
      return null;
    }
    render(createElement(StrictMode, null, createElement(TestComponent)));

    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every(Boolean)).toBe(true);
  });
});
