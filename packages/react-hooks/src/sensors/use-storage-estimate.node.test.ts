import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useStorageEstimate } from "./use-storage-estimate.ts";

const TestComponent = () => {
  const { supported } = useStorageEstimate();
  return supported ? "true" : "false";
};

describe(useStorageEstimate, () => {
  it("renders unsupported on the server, before navigator can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
