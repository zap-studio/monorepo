import type { ModelContext, RegisteredTool } from "@zap-studio/webmcp";

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWebMCPTool } from "./use-web-mcp-tool.ts";

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
    document.modelContext = createFakeModelContext();
  });

  afterEach(() => {
    Reflect.deleteProperty(document, "modelContext");
  });

  it("registers the tool on mount", async () => {
    const { result } = renderHook(() =>
      useWebMCPTool({
        name: LIKE_TOOL_NAME,
        description: LIKE_TOOL_DESCRIPTION,
        execute: async () => ({ liked: true }),
      }),
    );

    await waitFor(() => {
      expect(document.modelContext?.registerTool).toHaveBeenCalledOnce();
    });
    expect(result.current.error).toBeNull();
  });

  it("unregisters the tool on unmount", async () => {
    const { unmount } = renderHook(() =>
      useWebMCPTool({
        name: "posts_share",
        description: "Share a post by ID",
        execute: async () => ({ shared: true }),
      }),
    );

    await waitFor(async () => {
      expect(await document.modelContext?.getTools()).toHaveLength(1);
    });

    act(() => {
      unmount();
    });

    await waitFor(async () => {
      expect(await document.modelContext?.getTools()).toHaveLength(0);
    });
  });

  it("unregisters immediately if the component unmounts before registration resolves", async () => {
    const { unmount } = renderHook(() =>
      useWebMCPTool({
        name: "posts_delete",
        description: "Delete a post by ID",
        execute: async () => ({ deleted: true }),
      }),
    );

    unmount();

    await waitFor(async () => {
      expect(await document.modelContext?.getTools()).toHaveLength(0);
    });
  });

  it("re-registers when deps change", async () => {
    const { rerender } = renderHook(
      ({ id }: { id: string }) =>
        useWebMCPTool(
          { name: "posts_pin", description: "Pin a post by ID", execute: async () => ({ id }) },
          [id],
        ),
      { initialProps: { id: "a" } },
    );

    await waitFor(() => {
      expect(document.modelContext?.registerTool).toHaveBeenCalledTimes(1);
    });

    rerender({ id: "b" });

    await waitFor(() => {
      expect(document.modelContext?.registerTool).toHaveBeenCalledTimes(2);
    });
  });

  it("does not re-register when deps stay the same across renders", async () => {
    const { rerender } = renderHook(() =>
      useWebMCPTool(
        {
          name: "posts_flag",
          description: "Flag a post by ID",
          execute: async () => ({ flagged: true }),
        },
        ["stable"],
      ),
    );

    await waitFor(() => {
      expect(document.modelContext?.registerTool).toHaveBeenCalledTimes(1);
    });

    rerender();

    expect(document.modelContext?.registerTool).toHaveBeenCalledTimes(1);
  });

  it("wraps a non-Error rejection from registerTool in an Error", async () => {
    document.modelContext = {
      ...createFakeModelContext(),
      registerTool: vi.fn<ModelContext["registerTool"]>(() => Promise.reject("boom")),
    };

    const { result } = renderHook(() =>
      useWebMCPTool({
        name: LIKE_TOOL_NAME,
        description: LIKE_TOOL_DESCRIPTION,
        execute: async () => ({ liked: true }),
      }),
    );

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.error?.message).toBe("boom");
  });
});

describe("useWebMCPTool (unsupported)", () => {
  afterEach(() => {
    Reflect.deleteProperty(document, "modelContext");
  });

  it("surfaces an error instead of throwing when WebMCP is unsupported", async () => {
    const { result } = renderHook(() =>
      useWebMCPTool({
        name: LIKE_TOOL_NAME,
        description: LIKE_TOOL_DESCRIPTION,
        execute: async () => ({ liked: true }),
      }),
    );

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
  });

  it("does not surface an error if the component unmounts before rejection resolves", async () => {
    const { result, unmount } = renderHook(() =>
      useWebMCPTool({
        name: LIKE_TOOL_NAME,
        description: LIKE_TOOL_DESCRIPTION,
        execute: async () => ({ liked: true }),
      }),
    );

    unmount();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(result.current.error).toBeNull();
  });
});
