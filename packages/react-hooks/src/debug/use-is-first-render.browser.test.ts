import { createElement, StrictMode } from "react";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { renderHook } from "../../tests/_react.ts";
import { useIsFirstRender } from "./use-is-first-render.ts";

describe("useIsFirstRender", () => {
  it("is true on mount, then false on every later render", async () => {
    const { rerender, result } = await renderHook(() => useIsFirstRender());

    expect(result.current).toBe(true);

    await rerender();
    expect(result.current).toBe(false);

    await rerender();
    expect(result.current).toBe(false);
  });
});

describe("useIsFirstRender under StrictMode", () => {
  it("is true on both passes of the double-invoked mount render", async () => {
    const seen: boolean[] = [];
    const TestComponent = () => {
      seen.push(useIsFirstRender());
      return null;
    };
    await render(createElement(StrictMode, null, createElement(TestComponent)));

    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every(Boolean)).toBe(true);
  });
});
