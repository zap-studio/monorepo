import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useUpdateEffect } from "./use-update-effect.ts";

describe(useUpdateEffect, () => {
  it("does not call the effect during server rendering", () => {
    const effect = vi.fn();
    function TestComponent() {
      useUpdateEffect(effect, []);
      return "rendered";
    }

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("rendered");
    expect(effect).not.toHaveBeenCalled();
  });
});
