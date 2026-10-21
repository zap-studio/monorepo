/**
 * `defineTool`, `registerTool`, and `hasWebMCPSupport`: register JavaScript
 * tools with the native WebMCP `document.modelContext` API, safely across
 * server rendering and browsers that don't support it yet.
 *
 * @module @zap-studio/webmcp/register
 */

import type { ModelContextTool, RegisterToolOptions, WebMCPDocument } from "./types.ts";

import { WebMCPNotSupportedError } from "./errors.ts";

const NAME_PATTERN = /^[\w.-]{1,128}$/u;

/**
 * Validates a tool's `name` and `description`, then returns it unchanged.
 *
 * `name` must be 1-128 characters, using only letters, digits, `_`, `-`, or
 * `.`. `description` must be non-empty. Both are the two fields the WebMCP
 * spec requires and that the calling agent actually reads to decide whether
 * (and how) to call the tool — a name it can't reference, or a description
 * that says nothing, produces a tool no agent can use correctly.
 *
 * @param tool - The tool to validate.
 * @returns `tool`, unchanged.
 * @throws {TypeError} If `name` or `description` is invalid.
 *
 * @example
 * ```ts
 * import { defineTool } from "@zap-studio/webmcp";
 *
 * const likeTool = defineTool({
 *   name: "posts_like",
 *   description: "Like a post by ID",
 *   execute: async ({ id }: { id: string }) => ({ liked: true, id }),
 * });
 * ```
 */
export const defineTool = <TInput = unknown>(
  tool: ModelContextTool<TInput>,
): ModelContextTool<TInput> => {
  if (!NAME_PATTERN.test(tool.name)) {
    throw new TypeError(
      `Invalid WebMCP tool name "${tool.name}": must be 1-128 characters, using only letters, digits, "_", "-", or ".".`,
    );
  }

  if (tool.description.trim().length === 0) {
    throw new TypeError(`WebMCP tool "${tool.name}" must have a non-empty description.`);
  }

  return tool;
};

/**
 * Whether the current environment exposes the native WebMCP API.
 *
 * Always `false` during server rendering (no `document`), and `false` in
 * browsers that haven't shipped `document.modelContext` yet — as of this
 * package's release, that's every engine except Chrome/Edge behind an
 * experimental flag.
 *
 * @example
 * ```ts
 * import { hasWebMCPSupport } from "@zap-studio/webmcp";
 *
 * if (hasWebMCPSupport()) {
 *   // safe to call registerTool without handling WebMCPNotSupportedError
 * }
 * ```
 */
export const hasWebMCPSupport = (): boolean =>
  // SAFETY: WebMCPDocument only adds an optional `modelContext` field on top of the
  // real `Document` interface — it changes nothing about the object `document` refers to.
  typeof document !== "undefined" && (document as WebMCPDocument).modelContext !== undefined;

const noop = (): void => {};

/**
 * Registers a tool with the native WebMCP API.
 *
 * Safe to call during server rendering: resolves immediately with a no-op
 * unregister function, since there is no `document` to register against.
 *
 * In a browser without WebMCP support, the returned promise rejects with
 * {@link WebMCPNotSupportedError} — check {@link hasWebMCPSupport} first if
 * you want to skip registration instead of handling the rejection.
 *
 * Unregistration is signal-based, per the WebMCP spec: this function creates
 * its own internal `AbortController` (combined with `options.signal` when
 * given) and returns a function that aborts it. That returned function is
 * idempotent — calling it more than once is safe.
 *
 * @param tool - The tool to register. Consider validating it with
 *   {@link defineTool} first.
 * @param options - Registration options, forwarded to
 *   `document.modelContext.registerTool`.
 * @returns An idempotent function that unregisters the tool.
 * @throws {WebMCPNotSupportedError} If the browser doesn't support WebMCP.
 *
 * @example
 * ```ts
 * import { registerTool } from "@zap-studio/webmcp";
 *
 * const unregister = await registerTool({
 *   name: "posts_like",
 *   description: "Like a post by ID",
 *   execute: async ({ id }: { id: string }) => ({ liked: true, id }),
 * });
 *
 * unregister();
 * ```
 */
export const registerTool = async <TInput = unknown>(
  tool: ModelContextTool<TInput>,
  options?: RegisterToolOptions,
): Promise<() => void> => {
  if (typeof document === "undefined") {
    return noop;
  }

  // SAFETY: WebMCPDocument only adds an optional `modelContext` field on top of the
  // real `Document` interface — it changes nothing about the object `document` refers to.
  const modelContext = (document as WebMCPDocument).modelContext;
  if (modelContext === undefined) {
    throw new WebMCPNotSupportedError();
  }

  const controller = new AbortController();
  const signal = options?.signal
    ? AbortSignal.any([options.signal, controller.signal])
    : controller.signal;

  // SAFETY: ModelContextTool<TInput> and ModelContextTool<unknown> share the exact
  // same runtime shape — TInput only narrows execute's parameter type for callers
  // of this function, it changes nothing about what gets passed to the browser API.
  await modelContext.registerTool(tool as ModelContextTool, { ...options, signal });

  let unregistered = false;
  return () => {
    if (unregistered) {
      return;
    }
    unregistered = true;
    controller.abort();
  };
};
