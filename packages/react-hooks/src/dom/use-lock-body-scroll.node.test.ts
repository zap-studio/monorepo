import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useLockBodyScroll } from "./use-lock-body-scroll.ts";

function TestComponent() {
  useLockBodyScroll();
  return "ok";
}

describe(useLockBodyScroll, () => {
  it("renders without touching document.body during server rendering", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("ok");
  });
});
