/**
 * WebMCP type contracts: the native `document.modelContext` API shape, plus
 * this package's registration options.
 *
 * @module @zap-studio/webmcp/types
 */

/** Metadata hints attached to a tool, per the WebMCP spec. */
export interface ToolAnnotations {
  /** Marks the tool as safe to call without side effects. Defaults to `false`. */
  readOnlyHint?: boolean;
  /** Marks the tool's output as untrusted content. Defaults to `false`. */
  untrustedContentHint?: boolean;
}

/** Options passed to a tool's `execute` callback. */
export interface ToolExecuteCallbackOptions {
  /** Aborts when the caller cancels the tool call. */
  signal: AbortSignal;
}

/** A tool's execute callback: receives the validated input and an abort signal. */
export type ToolExecuteCallback<TInput = unknown> = (
  input: TInput,
  options: ToolExecuteCallbackOptions,
) => Promise<unknown>;

/**
 * A callable tool, per the WebMCP spec's `ModelContextTool` dictionary.
 *
 * @template TInput - The shape `execute` receives. This package does not
 *   validate `inputSchema` against `input` itself — the browser (or the
 *   calling agent) is responsible for that.
 *
 * @example
 * ```ts
 * const likeTool: ModelContextTool<{ id: string }> = {
 *   name: "posts_like",
 *   description: "Like a post by ID",
 *   execute: async ({ id }) => ({ liked: true, id }),
 * };
 * ```
 */
export interface ModelContextTool<TInput = unknown> {
  /** Unique tool identifier: 1-128 characters, letters, digits, `_`, `-`, or `.` only. */
  name: string;
  /** Natural-language description of what the tool does, for the calling agent. */
  description: string;
  /** Called when an agent invokes the tool. */
  execute: ToolExecuteCallback<TInput>;
  /** Optional metadata hints. */
  annotations?: ToolAnnotations;
  /** Optional JSON Schema describing `execute`'s input. */
  inputSchema?: object;
  /** Optional human-readable label, for UI display. */
  title?: string;
}

/** Options for `registerTool` / `document.modelContext.registerTool`. */
export interface RegisterToolOptions {
  /** Origins this tool is visible to. Defaults to same-origin only. */
  exposedTo?: string[];
  /** Unregisters the tool when aborted. `registerTool` combines this with its own internal signal. */
  signal?: AbortSignal;
}

/** Options for `document.modelContext.getTools`. */
export interface GetToolOptions {
  /** Filters returned tools by origin. */
  fromOrigins?: string[];
}

/** Options for `document.modelContext.executeTool`. */
export interface ExecuteToolOptions {
  /** Cancels the tool call. */
  signal?: AbortSignal;
}

/** A tool as returned by `document.modelContext.getTools`. */
export interface RegisteredTool {
  /** The tool's unique identifier. */
  name: string;
  /** Human-readable label. */
  title: string;
  /** Natural-language description of what the tool does. */
  description: string;
  /** Optional metadata hints. */
  annotations?: ToolAnnotations;
  /** Optional JSON Schema describing the tool's input. */
  inputSchema?: object;
  /** The serialized origin that registered the tool. */
  origin: string;
  /** The document window that registered the tool. */
  // oxlint-disable-next-line react-doctor/no-unguarded-browser-global-at-module-scope -- this declares the RegisteredTool.window property's type, per the WebMCP spec. It is a field name, not a read of the global `window` object.
  window: Window;
}

/** The native `document.modelContext` interface, per the WebMCP spec. */
export interface ModelContext {
  /** Registers a tool, making it callable by agents. */
  registerTool: (tool: ModelContextTool, options?: RegisterToolOptions) => Promise<undefined>;
  /** Lists currently registered tools. */
  getTools: (options?: GetToolOptions) => Promise<RegisteredTool[]>;
  /** Invokes a registered tool and returns its serialized result. */
  executeTool: (
    tool: RegisteredTool,
    inputObject?: Record<string, unknown>,
    options?: ExecuteToolOptions,
  ) => Promise<string>;
  /** Fires when the set of registered tools changes. */
  ontoolchange: ((event: Event) => void) | null;
}

/**
 * `Document`, narrowed with the native WebMCP entrypoint. Not yet part of
 * `lib.dom.d.ts` — experimental, and as of this package's release shipping
 * only in Chrome/Edge behind a flag.
 *
 * A plain type, not a `declare global` augmentation: global augmentations
 * are unsupported by JSR's public API analysis (and would leak into every
 * consumer's own `Document` type). Cast through this instead — `document as
 * WebMCPDocument` — at any call site that needs `modelContext` directly.
 */
export type WebMCPDocument = Document & { modelContext?: ModelContext };
