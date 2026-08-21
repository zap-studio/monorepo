import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useFiber } from "./use-fiber.ts";

function TestComponent() {
  const { fiber, ref } = useFiber<HTMLDivElement>();
  return createElement("div", { ref }, fiber ? "found" : "null");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe(useFiber, () => {
  it("renders null on the server, before any ref can attach", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("<div>null</div>");
  });

  it("no-ops (fiber: null) in production builds", () => {
    vi.stubEnv("NODE_ENV", "production");

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("<div>null</div>");
  });
});
