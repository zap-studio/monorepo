import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useClickOutside } from "./use-click-outside.ts";

const TestComponent = () => {
  const ref = useClickOutside<HTMLDivElement>(() => {});
  return createElement("div", { ref });
};

describe(useClickOutside, () => {
  it("renders without touching document during server rendering", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("<div></div>");
  });
});
