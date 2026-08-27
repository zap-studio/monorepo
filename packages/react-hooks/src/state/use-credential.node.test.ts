import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useCredential } from "./use-credential.ts";

const TestComponent = () => {
  const { supported } = useCredential();
  return supported ? "true" : "false";
};

describe(useCredential, () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
