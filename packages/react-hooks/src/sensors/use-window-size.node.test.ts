import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useWindowSize } from "./use-window-size.ts";

function TestComponent() {
  const { width, height } = useWindowSize();
  return `${width}x${height}`;
}

describe(useWindowSize, () => {
  it("falls back to 0x0 on the server, before window can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("0x0");
  });
});
