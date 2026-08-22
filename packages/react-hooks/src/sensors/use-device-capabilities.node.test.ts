import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useDeviceCapabilities } from "./use-device-capabilities.ts";

function TestComponent() {
  const { hardwareConcurrency, deviceMemory } = useDeviceCapabilities();
  return `${hardwareConcurrency},${deviceMemory}`;
}

describe(useDeviceCapabilities, () => {
  it("renders 0,undefined on the server, before navigator can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("0,undefined");
  });
});
