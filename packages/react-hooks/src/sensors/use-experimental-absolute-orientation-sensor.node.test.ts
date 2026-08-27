import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useExperimentalAbsoluteOrientationSensor } from "./use-experimental-absolute-orientation-sensor.ts";

const TestComponent = () => {
  const { supported } = useExperimentalAbsoluteOrientationSensor();
  return supported ? "true" : "false";
};

describe(useExperimentalAbsoluteOrientationSensor, () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
