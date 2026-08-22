import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { usePopover } from "./use-popover.ts";

function TestComponent() {
  const { isOpen, ref } = usePopover<HTMLDivElement>();
  return createElement("div", { ref }, isOpen ? "true" : "false");
}

describe(usePopover, () => {
  it("renders false on the server, before any toggle event can fire", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("<div>false</div>");
  });
});
