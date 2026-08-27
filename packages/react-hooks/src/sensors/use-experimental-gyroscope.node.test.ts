import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useExperimentalGyroscope } from "./use-experimental-gyroscope.ts";

const TestComponent = () => {
  const { supported } = useExperimentalGyroscope();
  return supported ? "true" : "false";
};

describe("useExperimentalGyroscope", () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
