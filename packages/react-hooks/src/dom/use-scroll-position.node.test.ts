import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useScrollPosition } from "./use-scroll-position.ts";

const TestComponent = () => {
  const { x, y } = useScrollPosition();
  return `${x},${y}`;
};

describe(useScrollPosition, () => {
  it("renders 0,0 on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("0,0");
  });
});
