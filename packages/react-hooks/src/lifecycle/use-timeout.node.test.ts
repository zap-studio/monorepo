import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useTimeout } from "./use-timeout.ts";

describe(useTimeout, () => {
  it("does not schedule during server rendering", () => {
    const callback = vi.fn();
    function TestComponent() {
      useTimeout(callback, 1000);
      return "rendered";
    }

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("rendered");
    expect(callback).not.toHaveBeenCalled();
  });
});
