import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useFavicon } from "./use-favicon.ts";

const TestComponent = () => {
  useFavicon("/favicon.svg");
  return "ok";
};

describe(useFavicon, () => {
  it("renders without touching document.head during server rendering", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("ok");
  });
});
