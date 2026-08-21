import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useMutationObserver } from "./use-mutation-observer.ts";

function TestComponent() {
  const ref = useMutationObserver<HTMLDivElement>(() => {});
  return createElement("div", { ref });
}

describe(useMutationObserver, () => {
  it("renders without touching MutationObserver during server rendering", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("<div></div>");
  });
});
