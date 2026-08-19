import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useVirtualKeyboard } from "./use-virtual-keyboard.ts";

function TestComponent() {
  const { width, height } = useVirtualKeyboard();
  return `${width}x${height}`;
}

describe(useVirtualKeyboard, () => {
  it("falls back to 0x0 on the server, before navigator can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("0x0");
  });
});
