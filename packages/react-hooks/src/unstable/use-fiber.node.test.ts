import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useFiber } from "./use-fiber.ts";

function TestComponent() {
  const { fiber, ref } = useFiber<HTMLDivElement>();
  return createElement("div", { ref }, fiber ? "found" : "null");
}

describe(useFiber, () => {
  it("renders null on the server, before any ref can attach", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("<div>null</div>");
  });
});
