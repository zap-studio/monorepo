import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useVibrate } from "./use-vibrate.ts";

const TestComponent = () => {
  const { supported } = useVibrate();
  return supported ? "true" : "false";
};

describe(useVibrate, () => {
  it("renders unsupported on the server, without touching navigator", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
