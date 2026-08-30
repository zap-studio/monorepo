import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useExperimentalLocalFonts } from "./use-experimental-local-fonts.ts";

const TestComponent = () => {
  const { supported } = useExperimentalLocalFonts();
  return supported ? "true" : "false";
};

describe("useExperimentalLocalFonts", () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
