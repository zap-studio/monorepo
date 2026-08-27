import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useExperimentalBarcodeDetector } from "./use-experimental-barcode-detector.ts";

const TestComponent = () => {
  const { supported } = useExperimentalBarcodeDetector();
  return supported ? "true" : "false";
};

describe(useExperimentalBarcodeDetector, () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
