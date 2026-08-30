import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useDebouncedValue } from "./use-debounced-value.ts";

const TestComponent = () => {
  return useDebouncedValue("initial", 500);
};

describe("useDebouncedValue", () => {
  it("renders the initial value on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("initial");
  });
});
