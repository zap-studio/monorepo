import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useIntersectionObserver } from "./use-intersection-observer.ts";

const TestComponent = () => {
  const { inView, ref } = useIntersectionObserver<HTMLDivElement>();
  return createElement("div", { ref }, inView ? "true" : "false");
};

describe(useIntersectionObserver, () => {
  it("renders false on the server, before any observation can fire", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("<div>false</div>");
  });
});
