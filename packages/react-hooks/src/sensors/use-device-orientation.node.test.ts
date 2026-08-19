import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useDeviceOrientation } from "./use-device-orientation.ts";

function TestComponent() {
  const { alpha, beta, gamma, absolute, supported } = useDeviceOrientation();
  return [alpha, beta, gamma, absolute, supported].join(",");
}

describe(useDeviceOrientation, () => {
  it("renders all-null orientation and unsupported on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe(",,,false,false");
  });
});
