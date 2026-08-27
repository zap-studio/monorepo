import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useCookieEnabled } from "./use-cookie-enabled.ts";

const TestComponent = () => {
  const cookiesEnabled = useCookieEnabled();
  return cookiesEnabled ? "true" : "false";
};

describe("useCookieEnabled", () => {
  it("renders false on the server, before navigator can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
