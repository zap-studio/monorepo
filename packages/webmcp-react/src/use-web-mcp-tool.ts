/**
 * `useWebMCPTool`: registers a tool with the native WebMCP API for as long
 * as the calling component is mounted.
 *
 * @module @zap-studio/webmcp-react/use-web-mcp-tool
 */

import type { ModelContextTool } from "@zap-studio/webmcp";
import type { DependencyList } from "react";

import { registerTool } from "@zap-studio/webmcp";
import { useEffect, useState } from "react";

/** The shape returned by `useWebMCPTool`. */
export interface UseWebMCPToolResult {
  /**
   * Set when registration fails — most commonly because the browser doesn't
   * support WebMCP, or `tool` failed validation. `null` while pending or
   * once registration succeeds.
   */
  error: Error | null;
}

/**
 * Registers `tool` with the native WebMCP API on mount, and unregisters it
 * on unmount. Re-registers whenever `deps` changes — this works just like
 * `useEffect`'s dependency array, so `tool` only needs a stable reference if
 * `deps` does not change between renders.
 *
 * Registration failures (most commonly an unsupported browser) are caught
 * and surfaced through the returned `error`, not thrown — a missing
 * agent-callable tool shouldn't crash the component tree.
 *
 * @param tool - The tool to register.
 * @param deps - Re-registers `tool` when these change. Defaults to `[]`
 *   (register once, on mount).
 *
 * @example
 * ```tsx
 * import { useWebMCPTool } from "@zap-studio/webmcp-react";
 *
 * function LikeButton({ postId }: { postId: string }) {
 *   const { error } = useWebMCPTool(
 *     {
 *       name: "posts_like",
 *       description: "Like a post by ID",
 *       execute: async ({ id }: { id: string }) => ({ liked: await likePost(id) }),
 *     },
 *     [postId],
 *   );
 *
 *   return (
 *     <button onClick={() => likePost(postId)}>
 *       Like{error ? " (agent tool unavailable)" : ""}
 *     </button>
 *   );
 * }
 * ```
 */
export const useWebMCPTool = <TInput = unknown>(
  tool: ModelContextTool<TInput>,
  deps: DependencyList = [],
): UseWebMCPToolResult => {
  const [error, setError] = useState<Error | null>(null);

  // oxlint-disable-next-line react-hooks/exhaustive-deps -- `deps` comes from the caller, like the dependency array of useEffect. This hook cannot know what is inside it.
  useEffect(() => {
    let cancelled = false;
    let cleanup = (): void => {};
    setError(null);

    const run = async () => {
      try {
        const unregisterTool = await registerTool(tool);
        if (cancelled) {
          unregisterTool();
          return;
        }
        cleanup = unregisterTool;
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught : new Error(String(caught)));
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      cleanup();
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- same pass-through `deps` as above; the rule cannot verify a non-literal dependency list.
  }, deps);

  return { error };
};
