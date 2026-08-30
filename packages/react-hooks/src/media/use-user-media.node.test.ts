import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useUserMedia } from "./use-user-media.ts";

const TestComponent = () => {
  const { status } = useUserMedia({ video: true });
  return status;
};

describe("useUserMedia", () => {
  it('renders "idle" on the server, before start() can be called', () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("idle");
  });
});
