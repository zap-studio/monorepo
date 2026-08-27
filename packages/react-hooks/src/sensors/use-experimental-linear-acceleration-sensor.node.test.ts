import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useExperimentalLinearAccelerationSensor } from "./use-experimental-linear-acceleration-sensor.ts";

const TestComponent = () => {
  const { supported } = useExperimentalLinearAccelerationSensor();
  return supported ? "true" : "false";
};

describe(useExperimentalLinearAccelerationSensor, () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
