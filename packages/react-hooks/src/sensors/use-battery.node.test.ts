import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useBattery } from "./use-battery.ts";

const TestComponent = () => {
  const { supported } = useBattery();
  return supported ? "true" : "false";
};

describe("useBattery", () => {
  it("renders unsupported on the server, before the effect can run", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
