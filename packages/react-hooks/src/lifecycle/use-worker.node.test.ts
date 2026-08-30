import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { asTestDouble } from "../../tests/_test-double.ts";
import { useWorker } from "./use-worker.ts";

const TestComponent = () => {
  const { supported } = useWorker(() => asTestDouble<Worker>({}));
  return supported ? "true" : "false";
};

describe("useWorker", () => {
  it("renders false on the server, before Worker can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
