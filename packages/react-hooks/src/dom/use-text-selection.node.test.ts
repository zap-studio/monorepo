import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useTextSelection } from "./use-text-selection.ts";

const TestComponent = () => {
  const text = useTextSelection();
  return `[${text}]`;
};

describe("useTextSelection", () => {
  it("renders an empty selection on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("[]");
  });
});
