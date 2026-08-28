import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useWorker } from "./use-worker.ts";

const TestComponent = () => {
  // SAFETY: this test only checks `supported` in a server-rendered (renderToString) component, and there useWorker's isSupported() check runs before `createWorker` is ever called, so this factory's `{}` stand-in for Worker is never called or read.
  const { supported } = useWorker(() => ({}) as Worker);
  return supported ? "true" : "false";
};

describe("useWorker", () => {
  it("renders false on the server, before Worker can be read", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false");
  });
});
