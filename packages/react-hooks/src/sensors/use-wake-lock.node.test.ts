import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useWakeLock } from "./use-wake-lock.ts";

function TestComponent() {
  const { supported, active } = useWakeLock();
  return `${supported},${active}`;
}

describe(useWakeLock, () => {
  it("renders unsupported and inactive on the server, without touching navigator", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("false,false");
  });
});
