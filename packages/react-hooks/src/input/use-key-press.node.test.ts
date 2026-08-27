import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useKeyPress } from "./use-key-press.ts";

const TestComponent = () => {
  const isPressed = useKeyPress("Shift");
  return isPressed ? "true" : "false";
};

describe(useKeyPress, () => {
  it("renders false on the server, before any key event can fire", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
