import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useExperimentalContactPicker } from "./use-experimental-contact-picker.ts";

function TestComponent() {
  const { supported } = useExperimentalContactPicker();
  return supported ? "true" : "false";
}

describe(useExperimentalContactPicker, () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
