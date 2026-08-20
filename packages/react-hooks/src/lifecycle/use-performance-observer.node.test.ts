import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { usePerformanceObserver } from "./use-performance-observer.ts";

function TestComponent() {
  const { supported } = usePerformanceObserver(vi.fn(), { entryTypes: ["longtask"] });
  return supported ? "true" : "false";
}

describe(usePerformanceObserver, () => {
  it("renders without crashing during server rendering", () => {
    // Node itself implements PerformanceObserver natively, so `supported` genuinely reflects
    // that here — unlike browser-only APIs, there's no "always false during SSR" guarantee to assert.
    const html = renderToString(createElement(TestComponent));

    expect(["true", "false"]).toContain(html);
  });
});
