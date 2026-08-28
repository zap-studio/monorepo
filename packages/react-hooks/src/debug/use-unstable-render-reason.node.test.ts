import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { html } from "../../tests/_html.ts";
import { useUnstableRenderReason } from "./use-unstable-render-reason.ts";

const TestComponent = () => {
  const { reason, ref } = useUnstableRenderReason<HTMLDivElement>();
  return createElement("div", { ref }, reason);
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("useUnstableRenderReason", () => {
  it("renders unknown on the server, before any ref can attach", () => {
    const output = renderToString(createElement(TestComponent));

    expect(output).toBe(html`<div>unknown</div>`);
  });

  it("no-ops (unknown) in production builds", () => {
    vi.stubEnv("NODE_ENV", "production");

    const output = renderToString(createElement(TestComponent));

    expect(output).toBe(html`<div>unknown</div>`);
  });
});
