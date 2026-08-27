import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useToggle } from "./use-toggle.ts";

const TestComponent = () => {
  const [value] = useToggle();
  return value ? "true" : "false";
};

describe(useToggle, () => {
  it("renders false on the server by default", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
