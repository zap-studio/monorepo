import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useCookie } from "./use-cookie.ts";

function TestComponent() {
  const { supported, value } = useCookie("theme");
  return `${supported},${value === undefined ? "undefined" : value}`;
}

describe(useCookie, () => {
  it("falls back to unsupported/undefined on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false,undefined");
  });
});
