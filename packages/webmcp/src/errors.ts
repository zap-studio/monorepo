/**
 * Error primitives for unsupported-environment failures.
 *
 * @module @zap-studio/webmcp/errors
 */

/**
 * Thrown by `registerTool` when the current browser doesn't expose the
 * native WebMCP API (`document.modelContext`).
 *
 * WebMCP is a Web Machine Learning Community Group draft, not a W3C
 * standard — as of this package's release it ships experimentally in
 * Chrome/Edge only. Check `hasWebMCPSupport()` first to skip registration
 * instead of handling this error, or install a community polyfill such as
 * `@mcp-b/webmcp-polyfill` to backfill support in other engines.
 *
 * @example
 * ```ts
 * import { registerTool, WebMCPNotSupportedError } from "@zap-studio/webmcp";
 *
 * try {
 *   await registerTool(likeTool);
 * } catch (error) {
 *   if (error instanceof WebMCPNotSupportedError) {
 *     // fall back to a regular button — no agent-callable tool here
 *   }
 * }
 * ```
 */
export class WebMCPNotSupportedError extends Error {
  /**
   * Creates a WebMCP-not-supported error with a descriptive default message.
   */
  constructor() {
    super(
      "WebMCP is not supported in this environment: `document.modelContext` is undefined. " +
        "WebMCP is an experimental, Chrome/Edge-only Web Platform API (not yet a W3C standard). " +
        "Check `hasWebMCPSupport()` before calling `registerTool`, or install a community " +
        "polyfill such as `@mcp-b/webmcp-polyfill` to backfill support in other browsers.",
    );
    this.name = "WebMCPNotSupportedError";
  }
}
