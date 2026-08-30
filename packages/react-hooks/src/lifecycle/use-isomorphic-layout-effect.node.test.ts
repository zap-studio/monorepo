import { createElement, useEffect } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.ts";

const TestComponent = () => {
  useIsomorphicLayoutEffect(() => {}, []);
  return "ok";
};

describe("useIsomorphicLayoutEffect", () => {
  it("falls back to useEffect where there is no document", () => {
    expect(useIsomorphicLayoutEffect).toBe(useEffect);
  });

  it("renders on the server without a useLayoutEffect warning", () => {
    const warn = vi.spyOn(console, "error").mockImplementation(() => {});

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("ok");
    expect(warn).not.toHaveBeenCalled();
  });
});
