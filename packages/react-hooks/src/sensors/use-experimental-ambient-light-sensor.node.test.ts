import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useExperimentalAmbientLightSensor } from "./use-experimental-ambient-light-sensor.ts";

const TestComponent = () => {
  const { supported } = useExperimentalAmbientLightSensor();
  return supported ? "true" : "false";
};

describe(useExperimentalAmbientLightSensor, () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
