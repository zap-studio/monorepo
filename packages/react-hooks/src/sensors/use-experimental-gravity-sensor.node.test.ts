import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useExperimentalGravitySensor } from "./use-experimental-gravity-sensor.ts";

function TestComponent() {
  const { supported } = useExperimentalGravitySensor();
  return supported ? "true" : "false";
}

describe(useExperimentalGravitySensor, () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
