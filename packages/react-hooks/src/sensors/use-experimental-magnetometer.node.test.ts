import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useExperimentalMagnetometer } from "./use-experimental-magnetometer.ts";

const TestComponent = () => {
  const { supported } = useExperimentalMagnetometer();
  return supported ? "true" : "false";
};

describe("useExperimentalMagnetometer", () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
