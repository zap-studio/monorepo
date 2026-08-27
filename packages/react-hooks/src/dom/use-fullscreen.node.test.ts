import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useFullscreen } from "./use-fullscreen.ts";

const TestComponent = () => {
  const { isFullscreen, ref } = useFullscreen<HTMLDivElement>();
  return createElement("div", { ref }, isFullscreen ? "true" : "false");
};

describe(useFullscreen, () => {
  it("renders false on the server, before any fullscreenchange can fire", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("<div>false</div>");
  });
});
