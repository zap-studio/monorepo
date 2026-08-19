import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { usePrefersDarkMode } from "./use-prefers-dark-mode.ts";

function TestComponent() {
  const prefersDark = usePrefersDarkMode();
  return prefersDark ? "true" : "false";
}

describe(usePrefersDarkMode, () => {
  it("renders false on the server, before matchMedia can run", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
