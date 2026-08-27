import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useGeolocation } from "./use-geolocation.ts";

const TestComponent = () => {
  const { coords, error, loading } = useGeolocation();
  return `${loading},${coords === undefined},${error === undefined}`;
};

describe("useGeolocation", () => {
  it("renders the initial loading state on the server, before the effect can run", () => {
    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("true,true,true");
  });
});
