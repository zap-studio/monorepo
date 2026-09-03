/**
 * `createToolRegistry`: batch-register a group of tools (e.g. every tool a
 * route exposes) and tear them all down together.
 *
 * @module @zap-studio/webmcp/registry
 */

import type { ModelContextTool, RegisterToolOptions } from "./types.ts";

import { registerTool } from "./register.ts";

/** A batch container for tools that mount and unmount together. */
export interface ToolRegistry {
  /** Adds a tool to the registry. Returns the registry for chaining. */
  add: (tool: ModelContextTool, options?: RegisterToolOptions) => ToolRegistry;
  /** Every tool added so far, in insertion order. */
  list: () => ModelContextTool[];
  /** Registers every added tool. Call `unmount` first to re-register from scratch. */
  mount: () => Promise<void>;
  /** Unregisters every tool this registry mounted. Idempotent, and safe pre-mount. */
  unmount: () => void;
}

/**
 * Creates an empty tool registry.
 *
 * Groups tools that share a lifecycle — e.g. every tool a route exposes — so
 * they mount and unmount together, instead of managing one `registerTool`
 * call (and one cleanup function) per tool by hand.
 *
 * @example
 * ```ts
 * import { createToolRegistry } from "@zap-studio/webmcp";
 *
 * const registry = createToolRegistry();
 * registry.add(likeTool).add(shareTool);
 *
 * await registry.mount(); // registers both
 * registry.unmount(); // unregisters both, e.g. on route leave
 * ```
 */
export const createToolRegistry = (): ToolRegistry => {
  const entries: { options: RegisterToolOptions | undefined; tool: ModelContextTool }[] = [];
  let unregisterFns: (() => void)[] = [];

  const registry: ToolRegistry = {
    add: (tool, options) => {
      entries.push({ options, tool });
      return registry;
    },
    list: () => entries.map((entry) => entry.tool),
    mount: async () => {
      unregisterFns = await Promise.all(
        entries.map((entry) => registerTool(entry.tool, entry.options)),
      );
    },
    unmount: () => {
      for (const unregister of unregisterFns) {
        unregister();
      }
      unregisterFns = [];
    },
  };

  return registry;
};
