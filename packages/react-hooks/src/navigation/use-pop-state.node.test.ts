import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { usePopState } from "./use-pop-state.ts";

const TestComponent = () => {
  const { pathname, state } = usePopState();
  return `${pathname},${state === null ? "null" : String(state)}`;
};

describe("usePopState", () => {
  it("falls back to pathname '/' and state null on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("/,null");
  });
});
