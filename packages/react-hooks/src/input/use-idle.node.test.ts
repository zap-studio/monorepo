import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useIdle } from "./use-idle.ts";

const TestComponent = () => {
  const isIdle = useIdle(1000);
  return isIdle ? "true" : "false";
};

describe(useIdle, () => {
  it("renders false on the server, before any timer can elapse", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
