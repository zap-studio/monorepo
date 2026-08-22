import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { usePointerLock } from "./use-pointer-lock.ts";

function TestComponent() {
  const { locked } = usePointerLock();
  return locked ? "true" : "false";
}

describe(usePointerLock, () => {
  it("renders false on the server, before pointerlockchange can fire", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
