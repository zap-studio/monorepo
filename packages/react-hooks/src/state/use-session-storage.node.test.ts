import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useSessionStorage } from "./use-session-storage.ts";

function TestComponent() {
  const [value] = useSessionStorage("draft", "initial");
  return value;
}

describe(useSessionStorage, () => {
  it("renders the initial value on the server, before sessionStorage can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("initial");
  });
});
