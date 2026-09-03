import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ModelContext, ModelContextTool, RegisteredTool } from "./types.ts";

import { createToolRegistry } from "./registry.ts";

const createFakeModelContext = (): ModelContext => {
  const tools = new Map<string, RegisteredTool>();

  return {
    executeTool: vi.fn<ModelContext["executeTool"]>(async () => "{}"),
    getTools: vi.fn<ModelContext["getTools"]>(async () => [...tools.values()]),
    ontoolchange: null,
    registerTool: vi.fn<ModelContext["registerTool"]>(async (tool, options) => {
      tools.set(tool.name, {
        name: tool.name,
        title: tool.title ?? tool.name,
        description: tool.description,
        origin: "http://localhost",
        window,
        ...(tool.annotations !== undefined && { annotations: tool.annotations }),
        ...(tool.inputSchema !== undefined && { inputSchema: tool.inputSchema }),
      });
      options?.signal?.addEventListener("abort", () => {
        tools.delete(tool.name);
      });
      return undefined;
    }),
  };
};

const likeTool: ModelContextTool = {
  name: "posts_like",
  description: "Like a post",
  execute: async () => "ok",
};
const shareTool: ModelContextTool = {
  name: "posts_share",
  description: "Share a post",
  execute: async () => "ok",
};

describe("createToolRegistry (browser)", () => {
  beforeEach(() => {
    document.modelContext = createFakeModelContext();
  });

  afterEach(() => {
    Reflect.deleteProperty(document, "modelContext");
  });

  it("registers every added tool on mount", async () => {
    const registry = createToolRegistry();
    registry.add(likeTool).add(shareTool);

    await registry.mount();

    expect(await document.modelContext?.getTools()).toHaveLength(2);
  });

  it("unregisters every mounted tool on unmount", async () => {
    const registry = createToolRegistry();
    registry.add(likeTool);

    await registry.mount();
    registry.unmount();

    expect(await document.modelContext?.getTools()).toHaveLength(0);
  });

  it("re-mounting after unmount registers again", async () => {
    const registry = createToolRegistry();
    registry.add(likeTool);

    await registry.mount();
    registry.unmount();
    await registry.mount();

    expect(await document.modelContext?.getTools()).toHaveLength(1);
  });
});
