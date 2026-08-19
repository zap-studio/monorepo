import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useIsMobile } from "./use-is-mobile.ts";

function TestComponent() {
  const isMobile = useIsMobile();
  return isMobile ? "true" : "false";
}

describe(useIsMobile, () => {
  it("renders false on the server, before matchMedia can run", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
