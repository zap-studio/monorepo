import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useDevicePixelRatio } from "./use-device-pixel-ratio.ts";

function TestComponent() {
  return String(useDevicePixelRatio());
}

describe(useDevicePixelRatio, () => {
  it("renders 1 on the server, before window can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("1");
  });
});
