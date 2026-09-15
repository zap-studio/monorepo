import type { ModelContext, RegisteredTool, WebMCPDocument } from "@zap-studio/webmcp";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

import { useWebMCPTool } from "./use-web-mcp-tool.ts";

// SAFETY: WebMCPDocument only adds an optional `modelContext` field on top of the
// real `Document` interface — it changes nothing about the object `document` refers to.
const testDocument = document as WebMCPDocument;

const LIKE_TOOL_NAME = "posts_like";
const LIKE_TOOL_DESCRIPTION = "Like a post by ID";

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

describe("useWebMCPTool (supported)", () => {
  beforeEach(() => {
    testDocument.modelContext = createFakeModelContext();
  });

  afterEach(() => {
    Reflect.deleteProperty(document, "modelContext");
  });

  it("registers the tool on mount", async () => {
    const { result } = await renderHook(() =>
      useWebMCPTool({
        name: LIKE_TOOL_NAME,
        description: LIKE_TOOL_DESCRIPTION,
        execute: async () => ({ liked: true }),
      }),
    );

    await vi.waitFor(() => {
      expect(testDocument.modelContext?.registerTool).toHaveBeenCalledOnce();
    });
    expect(result.current.error).toBeNull();
  });

  it("unregisters the tool on unmount", async () => {
    const { unmount } = await renderHook(() =>
      useWebMCPTool({
        name: "posts_share",
        description: "Share a post by ID",
        execute: async () => ({ shared: true }),
      }),
    );

    await vi.waitFor(async () => {
      expect(await testDocument.modelContext?.getTools()).toHaveLength(1);
    });

    await unmount();

    await vi.waitFor(async () => {
      expect(await testDocument.modelContext?.getTools()).toHaveLength(0);
    });
  });

  it("unregisters immediately if the component unmounts before registration resolves", async () => {
    const { unmount } = await renderHook(() =>
      useWebMCPTool({
        name: "posts_delete",
        description: "Delete a post by ID",
        execute: async () => ({ deleted: true }),
      }),
    );

    await unmount();

    await vi.waitFor(async () => {
      expect(await testDocument.modelContext?.getTools()).toHaveLength(0);
    });
  });

  it("re-registers when deps change", async () => {
    // `renderHook` types the callback's props as optional so that a no-argument
    // `rerender()` type-checks, hence the default.
    const initialProps = { id: "a" };
    const { rerender } = await renderHook(
      ({ id }: { id: string } = initialProps) =>
        useWebMCPTool(
          { name: "posts_pin", description: "Pin a post by ID", execute: async () => ({ id }) },
          [id],
        ),
      { initialProps },
    );

    await vi.waitFor(() => {
      expect(testDocument.modelContext?.registerTool).toHaveBeenCalledTimes(1);
    });

    await rerender({ id: "b" });

    await vi.waitFor(() => {
      expect(testDocument.modelContext?.registerTool).toHaveBeenCalledTimes(2);
    });
  });

  it("does not re-register when deps stay the same across renders", async () => {
    const { rerender } = await renderHook(() =>
      useWebMCPTool(
        {
          name: "posts_flag",
          description: "Flag a post by ID",
          execute: async () => ({ flagged: true }),
        },
        ["stable"],
      ),
    );

    await vi.waitFor(() => {
      expect(testDocument.modelContext?.registerTool).toHaveBeenCalledTimes(1);
    });

    await rerender();

    expect(testDocument.modelContext?.registerTool).toHaveBeenCalledTimes(1);
  });

  it("wraps a non-Error rejection from registerTool in an Error", async () => {
    testDocument.modelContext = {
      ...createFakeModelContext(),
      registerTool: vi.fn<ModelContext["registerTool"]>(() => Promise.reject("boom")),
    };

    const { result } = await renderHook(() =>
      useWebMCPTool({
        name: LIKE_TOOL_NAME,
        description: LIKE_TOOL_DESCRIPTION,
        execute: async () => ({ liked: true }),
      }),
    );

    await vi.waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.error?.message).toBe("boom");
  });

  it("does not surface an error if the component unmounts before rejection resolves", async () => {
    // Rendering flushes microtasks, so the registration has to stay pending until
    // after unmount for this to exercise the unmount guard at all.
    let rejectRegisterTool: (reason: Error) => void = (_reason: Error) => undefined;
    testDocument.modelContext = {
      ...createFakeModelContext(),
      registerTool: vi.fn<ModelContext["registerTool"]>(
        async () =>
          new Promise<undefined>((_resolve, reject) => {
            rejectRegisterTool = reject;
          }),
      ),
    };

    const { result, unmount } = await renderHook(() =>
      useWebMCPTool({
        name: LIKE_TOOL_NAME,
        description: LIKE_TOOL_DESCRIPTION,
        execute: async () => ({ liked: true }),
      }),
    );

    await unmount();
    rejectRegisterTool(new Error("boom"));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(result.current.error).toBeNull();
  });
});

describe("useWebMCPTool (unsupported)", () => {
  afterEach(() => {
    Reflect.deleteProperty(document, "modelContext");
  });

  it("surfaces an error instead of throwing when WebMCP is unsupported", async () => {
    const { result } = await renderHook(() =>
      useWebMCPTool({
        name: LIKE_TOOL_NAME,
        description: LIKE_TOOL_DESCRIPTION,
        execute: async () => ({ liked: true }),
      }),
    );

    await vi.waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
  });
});
