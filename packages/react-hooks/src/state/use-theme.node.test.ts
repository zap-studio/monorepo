import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useTheme } from "./use-theme.ts";

const TestComponent = () => {
  const { theme } = useTheme();
  return theme;
};

describe(useTheme, () => {
  it('renders theme: "system" on the server, before matchMedia/localStorage can be read', () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("system");
  });
});
