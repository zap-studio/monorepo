import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useWebMCPTool } from "./use-web-mcp-tool.ts";

describe("useWebMCPTool (node/SSR)", () => {
  it("renders without registering anything on the server", () => {
    const TestComponent = () => {
      const { error } = useWebMCPTool({
        name: "posts_like",
        description: "Like a post by ID",
        execute: async () => ({ liked: true }),
      });
      return error ? "error" : "ok";
    };

    const html = renderToString(createElement(TestComponent));

    expect(html).toBe("ok");
  });
});
