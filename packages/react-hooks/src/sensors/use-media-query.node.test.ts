import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useMediaQuery } from "./use-media-query.ts";

const TestComponent = () => {
  const matches = useMediaQuery("(min-width: 600px)");
  return matches ? "true" : "false";
};

describe(useMediaQuery, () => {
  it("renders false on the server, before matchMedia can run", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
