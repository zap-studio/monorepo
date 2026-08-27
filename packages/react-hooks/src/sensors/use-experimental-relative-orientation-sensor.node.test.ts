import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useExperimentalRelativeOrientationSensor } from "./use-experimental-relative-orientation-sensor.ts";

const TestComponent = () => {
  const { supported } = useExperimentalRelativeOrientationSensor();
  return supported ? "true" : "false";
};

describe("useExperimentalRelativeOrientationSensor", () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
