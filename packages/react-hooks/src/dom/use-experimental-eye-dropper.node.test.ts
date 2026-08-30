import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useExperimentalEyeDropper } from "./use-experimental-eye-dropper.ts";

const TestComponent = () => {
  const { supported } = useExperimentalEyeDropper();
  return supported ? "true" : "false";
};

describe("useExperimentalEyeDropper", () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
