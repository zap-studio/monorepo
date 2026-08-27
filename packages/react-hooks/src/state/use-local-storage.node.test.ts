import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useLocalStorage } from "./use-local-storage.ts";

const TestComponent = () => {
  const [value] = useLocalStorage("count", 0);
  return String(value);
};

describe(useLocalStorage, () => {
  it("renders the initial value on the server, before localStorage can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("0");
  });
});
