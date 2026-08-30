import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useVisualViewport } from "./use-visual-viewport.ts";

const TestComponent = () => {
  const { width, height, scale } = useVisualViewport();
  return `${width}x${height}@${scale}`;
};

describe("useVisualViewport", () => {
  it("falls back to 0x0@1 on the server, before window can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("0x0@1");
  });
});
