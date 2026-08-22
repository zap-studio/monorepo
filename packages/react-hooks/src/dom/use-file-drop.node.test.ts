import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useFileDrop } from "./use-file-drop.ts";

function TestComponent() {
  const { isOver, ref } = useFileDrop<HTMLDivElement>(() => {});
  return createElement("div", { ref }, isOver ? "true" : "false");
}

describe(useFileDrop, () => {
  it("renders false on the server, before any drag event can fire", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("<div>false</div>");
  });
});
