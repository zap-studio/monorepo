import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useWebLock } from "./use-web-lock.ts";

const TestComponent = () => {
  const { supported } = useWebLock("my-lock");
  return supported ? "true" : "false";
};

describe("useWebLock", () => {
  it("renders without crashing during server rendering", () => {
    // Node itself implements the Web Locks API natively, so `supported` genuinely reflects
    // that here — unlike browser-only APIs, there's no "always false during SSR" guarantee to assert.
    const html = renderToString(createElement(TestComponent));

    expect(["true", "false"]).toContain(html);
  });
});
