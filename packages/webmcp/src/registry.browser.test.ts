import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ModelContext, ModelContextTool, RegisteredTool, WebMCPDocument } from "./types.ts";

import { createToolRegistry } from "./registry.ts";

// SAFETY: WebMCPDocument only adds an optional `modelContext` field on top of the
// real `Document` interface — it changes nothing about the object `document` refers to.
const testDocument = document as WebMCPDocument;

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
    testDocument.modelContext = createFakeModelContext();
  });

  afterEach(() => {
    Reflect.deleteProperty(document, "modelContext");
  });

  it("registers every added tool on mount", async () => {
    const registry = createToolRegistry();
    registry.add(likeTool).add(shareTool);

    await registry.mount();

    expect(await testDocument.modelContext?.getTools()).toHaveLength(2);
  });

  it("unregisters every mounted tool on unmount", async () => {
    const registry = createToolRegistry();
    registry.add(likeTool);

    await registry.mount();
    registry.unmount();

    expect(await testDocument.modelContext?.getTools()).toHaveLength(0);
  });

  it("re-mounting after unmount registers again", async () => {
    const registry = createToolRegistry();
    registry.add(likeTool);

    await registry.mount();
    registry.unmount();
    await registry.mount();

    expect(await testDocument.modelContext?.getTools()).toHaveLength(1);
  });

  it("unregisters already-succeeded tools when another tool fails to register", async () => {
    const modelContext = createFakeModelContext();
    const register = modelContext.registerTool;
    modelContext.registerTool = vi.fn<ModelContext["registerTool"]>(async (tool, options) => {
      if (tool.name === shareTool.name) {
        throw new Error("boom");
      }
      return register(tool, options);
    });
    testDocument.modelContext = modelContext;

    const registry = createToolRegistry();
    registry.add(likeTool).add(shareTool);

    await expect(registry.mount()).rejects.toThrow("boom");
    expect(await testDocument.modelContext?.getTools()).toHaveLength(0);
  });

  it("unregisters a registration that resolves after unmount ran while mount was pending", async () => {
    let resolveRegistration: (() => void) | undefined;
    const modelContext = createFakeModelContext();
    const register = modelContext.registerTool;
    modelContext.registerTool = vi.fn<ModelContext["registerTool"]>(async (tool, options) => {
      await new Promise<void>((resolve) => {
        resolveRegistration = resolve;
      });
      return register(tool, options);
    });
    testDocument.modelContext = modelContext;

    const registry = createToolRegistry();
    registry.add(likeTool);

    const mounting = registry.mount();
    registry.unmount();
    resolveRegistration?.();
    await mounting;

    expect(await testDocument.modelContext?.getTools()).toHaveLength(0);
  });
});
