import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useExperimentalNfc } from "./use-experimental-nfc.ts";

function TestComponent() {
  const { supported } = useExperimentalNfc();
  return supported ? "true" : "false";
}

describe(useExperimentalNfc, () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
