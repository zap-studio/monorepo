import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useUnstableWhyDidYouUpdate } from "./use-unstable-why-did-you-update.ts";

function TestComponent(props: { value: number }) {
  useUnstableWhyDidYouUpdate("TestComponent", props);
  return "ok";
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe(useUnstableWhyDidYouUpdate, () => {
  it("renders without touching console during server rendering", () => {
    const html = renderToString(createElement(TestComponent, { value: 1 }));

    expect(html).toBe("ok");
  });

  it("selects the no-op effect in production builds", () => {
    vi.stubEnv("NODE_ENV", "production");

    const html = renderToString(createElement(TestComponent, { value: 1 }));

    expect(html).toBe("ok");
  });
});
