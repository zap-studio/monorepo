import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useExperimentalAccelerometer } from "./use-experimental-accelerometer.ts";

const TestComponent = () => {
  const { supported } = useExperimentalAccelerometer();
  return supported ? "true" : "false";
};

describe("useExperimentalAccelerometer", () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
