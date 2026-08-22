import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useNavigationBlocker } from "./use-navigation-blocker.ts";

function TestComponent() {
  const { blocked } = useNavigationBlocker(() => true);
  return blocked ? "true" : "false";
}

describe(useNavigationBlocker, () => {
  it("renders false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
