import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { html } from "../tests/_html.ts";
import { useMutationObserver } from "./use-mutation-observer.ts";

const TestComponent = () => {
  const ref = useMutationObserver<HTMLDivElement>(() => {});
  return createElement("div", { ref });
};

describe("useMutationObserver", () => {
  it("renders without touching MutationObserver during server rendering", () => {
    const output = renderToString(createElement(TestComponent));

    expect(output).toBe(html`<div></div>`);
  });
});
