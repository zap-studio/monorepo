import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useAsync } from "./use-async.ts";

const TestComponent = () => {
  const { loading } = useAsync(() => Promise.resolve(1));
  return loading ? "true" : "false";
};

describe(useAsync, () => {
  it("renders loading: true on the server, before the effect can run", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("true");
  });
});
