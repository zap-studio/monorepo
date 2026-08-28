import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { html } from "../tests/_html.ts";
import { useFileDrop } from "./use-file-drop.ts";

const TestComponent = () => {
  const { isOver, ref } = useFileDrop<HTMLDivElement>(() => {});
  return createElement("div", { ref }, isOver ? "true" : "false");
};

describe("useFileDrop", () => {
  it("renders false on the server, before any drag event can fire", () => {
    const output = renderToString(createElement(TestComponent));

    expect(output).toBe(html`<div>false</div>`);
  });
});
