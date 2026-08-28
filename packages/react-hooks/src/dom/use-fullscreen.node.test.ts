import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { html } from "../tests/_html.ts";
import { useFullscreen } from "./use-fullscreen.ts";

const TestComponent = () => {
  const { isFullscreen, ref } = useFullscreen<HTMLDivElement>();
  return createElement("div", { ref }, isFullscreen ? "true" : "false");
};

describe("useFullscreen", () => {
  it("renders false on the server, before any fullscreenchange can fire", () => {
    const output = renderToString(createElement(TestComponent));

    expect(output).toBe(html`<div>false</div>`);
  });
});
