import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useNavigationType } from "./use-navigation-type.ts";

const TestComponent = () => {
  return useNavigationType();
};

describe("useNavigationType", () => {
  it('falls back to "navigate" on the server', () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("navigate");
  });
});
