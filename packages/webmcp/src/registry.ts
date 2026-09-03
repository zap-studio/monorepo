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
  /**
   * Registers every added tool. Call `unmount` first to re-register from scratch.
   *
   * All-or-nothing: if any tool fails to register, every tool that did
   * succeed is unregistered again before this rejects with the first
   * failure's reason. If `unmount` runs while this is still pending, any
   * tool that finishes registering afterward is unregistered immediately
   * instead of being left agent-callable with no way to reach it.
   */
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
  let generation = 0;

  const registry: ToolRegistry = {
    add: (tool, options) => {
      entries.push({ options, tool });
      return registry;
    },
    list: () => entries.map((entry) => entry.tool),
    mount: async () => {
      generation++;
      const ownGeneration = generation;
      const settled = await Promise.allSettled(
        entries.map((entry) => registerTool(entry.tool, entry.options)),
      );
      const fulfilled = settled.filter(
        (result): result is PromiseFulfilledResult<() => void> => result.status === "fulfilled",
      );

      // `unmount` (or a newer `mount`) ran while this call was still pending —
      // don't let these registrations outlive it; unregister and stop here
      // instead of overwriting whatever state that later call left behind.
      if (ownGeneration !== generation) {
        for (const result of fulfilled) {
          result.value();
        }
        return;
      }

      unregisterFns = fulfilled.map((result) => result.value);

      const rejected = settled.find(
        (result): result is PromiseRejectedResult => result.status === "rejected",
      );
      if (rejected) {
        registry.unmount();
        throw rejected.reason;
      }
    },
    unmount: () => {
      generation++;
      for (const unregister of unregisterFns) {
        unregister();
      }
      unregisterFns = [];
    },
  };

  return registry;
};
