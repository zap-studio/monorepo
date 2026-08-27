import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useDeviceMotion } from "./use-device-motion.ts";

const TestComponent = () => {
  const { acceleration, interval, supported } = useDeviceMotion();
  return [acceleration, interval, supported].join(",");
};

describe("useDeviceMotion", () => {
  it("renders null acceleration and unsupported on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe(",0,false");
  });
});
