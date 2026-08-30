import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useExperimentalIdleDetector } from "./use-experimental-idle-detector.ts";

const TestComponent = () => {
  const { supported } = useExperimentalIdleDetector();
  return supported ? "true" : "false";
};

describe("useExperimentalIdleDetector", () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
