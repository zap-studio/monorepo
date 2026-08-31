import { createStore } from "@zap-studio/store";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useStore } from "./use-store.ts";

describe("useStore", () => {
  it("renders the store's state on the server", () => {
    const counter = createStore({ count: 5 });
    const TestComponent = () => {
      const state = useStore(counter);
      return String(state.count);
    };

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("5");
  });
});
