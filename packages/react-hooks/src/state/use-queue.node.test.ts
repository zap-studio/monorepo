import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useQueue } from "./use-queue.ts";

const TestComponent = () => {
  const { first, last } = useQueue<string>(["a", "b"]);
  return `${first},${last}`;
};

describe("useQueue", () => {
  it("renders the initial values on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("a,b");
  });
});
