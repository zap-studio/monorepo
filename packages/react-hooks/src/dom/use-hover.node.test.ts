import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { html } from "../tests/_html.ts";
import { useHover } from "./use-hover.ts";

const TestComponent = () => {
  const { hovered, ref } = useHover<HTMLDivElement>();
  return createElement("div", { ref }, hovered ? "true" : "false");
};

describe("useHover", () => {
  it("renders false on the server, before any mouseenter can fire", () => {
    const output = renderToString(createElement(TestComponent));

    expect(output).toBe(html`<div>false</div>`);
  });
});
