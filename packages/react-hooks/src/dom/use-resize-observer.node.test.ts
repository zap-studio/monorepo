import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { html } from "../tests/_html.ts";
import { useResizeObserver } from "./use-resize-observer.ts";

const TestComponent = () => {
  const { ref, size } = useResizeObserver<HTMLDivElement>();
  return createElement("div", { ref }, size ? "sized" : "unsized");
};

describe("useResizeObserver", () => {
  it("renders unsized on the server, before any observation can fire", () => {
    const output = renderToString(createElement(TestComponent));

    expect(output).toBe(html`<div>unsized</div>`);
  });
});
