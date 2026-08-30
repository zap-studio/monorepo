import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { usePointer } from "./use-pointer.ts";

const TestComponent = () => {
  const { isDown, pointerType } = usePointer();
  return `${pointerType},${isDown}`;
};

describe("usePointer", () => {
  it("renders the all-empty/false initial state on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe(",false");
  });
});
