import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useOrientation } from "./use-orientation.ts";

const TestComponent = () => {
  const { angle, type } = useOrientation();
  return `${angle},${type ?? "undefined"}`;
};

describe(useOrientation, () => {
  it("falls back to angle 0 and undefined type on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("0,undefined");
  });
});
