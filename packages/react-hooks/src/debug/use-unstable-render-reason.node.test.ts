import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useUnstableRenderReason } from "./use-unstable-render-reason.ts";

const TestComponent = () => {
  const { reason, ref } = useUnstableRenderReason<HTMLDivElement>();
  return createElement("div", { ref }, reason);
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe(useUnstableRenderReason, () => {
  it("renders unknown on the server, before any ref can attach", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("<div>unknown</div>");
  });

  it("no-ops (unknown) in production builds", () => {
    vi.stubEnv("NODE_ENV", "production");

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("<div>unknown</div>");
  });
});
