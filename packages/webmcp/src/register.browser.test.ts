import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ModelContext, RegisteredTool, WebMCPDocument } from "./types.ts";

import { WebMCPNotSupportedError } from "./errors.ts";
import { defineTool, hasWebMCPSupport, registerTool } from "./register.ts";

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

describe("registerTool (browser, supported)", () => {
  beforeEach(() => {
    testDocument.modelContext = createFakeModelContext();
  });

  afterEach(() => {
    Reflect.deleteProperty(document, "modelContext");
  });

  it("reports support once the fake is installed", () => {
    expect(hasWebMCPSupport()).toBe(true);
  });

  it("registers a tool against document.modelContext", async () => {
    const tool = defineTool({
      name: "posts_like",
      description: "Like a post by ID",
      execute: async () => ({ liked: true }),
    });

    await registerTool(tool);

    expect(testDocument.modelContext?.registerTool).toHaveBeenCalledExactlyOnceWith(
      tool,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("returns an unregister function that removes the tool", async () => {
    const unregister = await registerTool(
      defineTool({
        name: "posts_share",
        description: "Share a post by ID",
        execute: async () => ({ shared: true }),
      }),
    );

    expect(await testDocument.modelContext?.getTools()).toHaveLength(1);

    unregister();

    expect(await testDocument.modelContext?.getTools()).toHaveLength(0);
  });

  it("is idempotent: calling unregister twice does not throw", async () => {
    const unregister = await registerTool(
      defineTool({
        name: "posts_flag",
        description: "Flag a post by ID",
        execute: async () => ({ flagged: true }),
      }),
    );

    unregister();
    expect(() => unregister()).not.toThrow();
    expect(await testDocument.modelContext?.getTools()).toHaveLength(0);
  });

  it("combines a caller-provided signal with its own", async () => {
    const controller = new AbortController();
    const tool = defineTool({
      name: "posts_pin",
      description: "Pin a post by ID",
      execute: async () => ({ pinned: true }),
    });

    await registerTool(tool, { signal: controller.signal });
    controller.abort();

    expect(await testDocument.modelContext?.getTools()).toHaveLength(0);
  });
});

describe("registerTool (browser, unsupported)", () => {
  afterEach(() => {
    Reflect.deleteProperty(document, "modelContext");
  });

  it("reports no support when document.modelContext is absent", () => {
    expect(hasWebMCPSupport()).toBe(false);
  });

  it("rejects with WebMCPNotSupportedError when document.modelContext is absent", async () => {
    await expect(
      registerTool(
        defineTool({
          name: "posts_like",
          description: "Like a post by ID",
          execute: async () => ({ liked: true }),
        }),
      ),
    ).rejects.toThrow(WebMCPNotSupportedError);
  });
});
