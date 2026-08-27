import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useColorScheme } from "./use-color-scheme.ts";

const TestComponent = () => {
  return useColorScheme();
};

describe("useColorScheme", () => {
  it('renders "light" on the server, before matchMedia can run', () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("light");
  });
});
