import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useViewTransition } from "./use-view-transition.ts";

const TestComponent = () => {
  const { supported } = useViewTransition();
  return supported ? "true" : "false";
};

describe("useViewTransition", () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
