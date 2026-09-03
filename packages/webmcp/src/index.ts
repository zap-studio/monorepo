/**
 * Public entrypoint for the webmcp package.
 *
 * @module @zap-studio/webmcp
 */

export { WebMCPNotSupportedError } from "./errors.ts";
export { defineTool, hasWebMCPSupport, registerTool } from "./register.ts";
export { createToolRegistry } from "./registry.ts";
export type { ToolRegistry } from "./registry.ts";
export type {
  ExecuteToolOptions,
  GetToolOptions,
  ModelContext,
  ModelContextTool,
  RegisteredTool,
  RegisterToolOptions,
  ToolAnnotations,
  ToolExecuteCallback,
  ToolExecuteCallbackOptions,
} from "./types.ts";
