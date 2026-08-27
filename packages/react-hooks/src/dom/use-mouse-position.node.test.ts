import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useMousePosition } from "./use-mouse-position.ts";

const TestComponent = () => {
  const { clientX, clientY } = useMousePosition();
  return `${clientX},${clientY}`;
};

describe(useMousePosition, () => {
  it("renders 0,0 on the server, before any mousemove can fire", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("0,0");
  });
});
