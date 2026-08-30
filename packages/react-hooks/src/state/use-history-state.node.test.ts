import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useHistoryState } from "./use-history-state.ts";

const TestComponent = () => {
  const { value, canUndo, canRedo } = useHistoryState("a");
  return `${value},${canUndo},${canRedo}`;
};

describe("useHistoryState", () => {
  it("renders the initial value on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("a,false,false");
  });
});
