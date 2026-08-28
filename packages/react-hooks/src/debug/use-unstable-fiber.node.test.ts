import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { html } from "../tests/_html.ts";
import { useUnstableFiber } from "./use-unstable-fiber.ts";

const TestComponent = () => {
  const { fiber, ref } = useUnstableFiber<HTMLDivElement>();
  return createElement("div", { ref }, fiber ? "found" : "null");
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("useUnstableFiber", () => {
  it("renders null on the server, before any ref can attach", () => {
    const output = renderToString(createElement(TestComponent));

    expect(output).toBe(html`<div>null</div>`);
  });

  it("no-ops (fiber: null) in production builds", () => {
    vi.stubEnv("NODE_ENV", "production");

    const output = renderToString(createElement(TestComponent));

    expect(output).toBe(html`<div>null</div>`);
  });
});
