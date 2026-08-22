import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useThrottledValue } from "./use-throttled-value.ts";

function TestComponent() {
  const value = useThrottledValue("initial", 500);
  return value;
}

describe(useThrottledValue, () => {
  it("renders the initial value on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("initial");
  });
});
