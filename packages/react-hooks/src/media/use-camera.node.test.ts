import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useCamera } from "./use-camera.ts";

function TestComponent() {
  const { status } = useCamera();
  return status;
}

describe(useCamera, () => {
  it('renders "idle" on the server, before start() can be called', () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("idle");
  });
});
