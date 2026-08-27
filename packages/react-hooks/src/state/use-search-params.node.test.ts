import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useSearchParams } from "./use-search-params.ts";

const TestComponent = () => {
  const [searchParams] = useSearchParams();
  return searchParams.size === 0 ? "empty" : searchParams.toString();
};

describe("useSearchParams", () => {
  it("falls back to empty params on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("empty");
  });
});
