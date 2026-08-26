import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useOwnerStack } from "./use-owner-stack.ts";

function TestComponent() {
  const { supported } = useOwnerStack();
  return supported ? "true" : "false";
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe(useOwnerStack, () => {
  it("renders without throwing during server rendering", () => {
    expect(() => renderToString(createElement(TestComponent))).not.toThrow();
  });

  it("reports supported: false in production builds", () => {
    vi.stubEnv("NODE_ENV", "production");

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
