import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useBeforeUnload } from "./use-before-unload.ts";

describe(useBeforeUnload, () => {
  it("renders without touching window during server rendering", () => {
    const handler = vi.fn();
    const TestComponent = () => {
      useBeforeUnload(handler);
      return "rendered";
    };

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("rendered");
  });
});
