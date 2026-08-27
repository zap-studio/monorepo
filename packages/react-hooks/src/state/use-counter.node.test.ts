import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useCounter } from "./use-counter.ts";

const TestComponent = () => {
  const { count } = useCounter(5);
  return String(count);
};

describe(useCounter, () => {
  it("renders the initial value on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("5");
  });
});
