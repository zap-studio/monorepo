import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useScreenCapture } from "./use-screen-capture.ts";

function TestComponent() {
  const { status } = useScreenCapture();
  return status;
}

describe(useScreenCapture, () => {
  it('renders "idle" on the server, before start() can be called', () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("idle");
  });
});
