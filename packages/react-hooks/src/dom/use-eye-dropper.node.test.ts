import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useEyeDropper } from "./use-eye-dropper.ts";

function TestComponent() {
  const { supported } = useEyeDropper();
  return supported ? "true" : "false";
}

describe(useEyeDropper, () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
