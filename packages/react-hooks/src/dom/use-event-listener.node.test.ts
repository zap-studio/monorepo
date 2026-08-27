import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useEventListener } from "./use-event-listener.ts";

const TestComponent = () => {
  useEventListener(undefined, "click", () => {});
  return "ok";
};

describe(useEventListener, () => {
  it("renders without touching any global during server rendering", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("ok");
  });
});
