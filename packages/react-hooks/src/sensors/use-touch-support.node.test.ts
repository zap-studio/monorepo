import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useTouchSupport } from "./use-touch-support.ts";

function TestComponent() {
  const hasTouch = useTouchSupport();
  return hasTouch ? "true" : "false";
}

describe(useTouchSupport, () => {
  it("renders false on the server, before navigator can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
