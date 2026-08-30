import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useHashState } from "./use-hash-state.ts";

const TestComponent = () => {
  const [hash] = useHashState();
  return hash === "" ? "empty" : hash;
};

describe("useHashState", () => {
  it("falls back to an empty hash on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("empty");
  });
});
