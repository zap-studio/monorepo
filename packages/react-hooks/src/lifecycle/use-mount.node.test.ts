import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useMount } from "./use-mount.ts";

describe("useMount", () => {
  it("does not call the effect during server rendering", () => {
    const effect = vi.fn<() => void>();
    const TestComponent = () => {
      useMount(effect);
      return "rendered";
    };

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("rendered");
    expect(effect).not.toHaveBeenCalled();
  });
});
