import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useGamepad } from "./use-gamepad.ts";

function TestComponent() {
  const gamepads = useGamepad();
  return String(gamepads.length);
}

describe(useGamepad, () => {
  it("renders an empty list on the server, before navigator.getGamepads() can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("0");
  });
});
