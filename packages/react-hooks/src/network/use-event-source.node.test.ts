import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useEventSource } from "./use-event-source.ts";

function TestComponent() {
  const { status } = useEventSource(undefined);
  return status;
}

describe(useEventSource, () => {
  it('renders "closed" on the server when no url is given', () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("closed");
  });
});
