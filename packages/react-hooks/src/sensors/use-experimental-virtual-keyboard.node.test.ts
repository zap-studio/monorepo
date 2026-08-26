import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useExperimentalVirtualKeyboard } from "./use-experimental-virtual-keyboard.ts";

function TestComponent() {
  const { width, height } = useExperimentalVirtualKeyboard();
  return `${width}x${height}`;
}

describe(useExperimentalVirtualKeyboard, () => {
  it("falls back to 0x0 on the server, before navigator can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("0x0");
  });
});
