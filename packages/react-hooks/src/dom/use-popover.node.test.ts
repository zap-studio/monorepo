import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { html } from "../../tests/_html.ts";
import { usePopover } from "./use-popover.ts";

const TestComponent = () => {
  const { isOpen, ref } = usePopover<HTMLDivElement>();
  return createElement("div", { ref }, isOpen ? "true" : "false");
};

describe("usePopover", () => {
  it("renders false on the server, before any toggle event can fire", () => {
    const output = renderToString(createElement(TestComponent));

    expect(output).toBe(html`<div>false</div>`);
  });
});
