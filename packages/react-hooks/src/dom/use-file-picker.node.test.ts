import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useFilePicker } from "./use-file-picker.ts";

const TestComponent = () => {
  const { supported } = useFilePicker();
  return supported ? "true" : "false";
};

describe(useFilePicker, () => {
  it("renders supported: false on the server", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
