# @zap-studio/webmcp

A framework-agnostic, SSR-safe wrapper around the native WebMCP `document.modelContext` API, with a batch tool registry for exposing JavaScript tools to AI agents.

Full documentation: [zapstudio.dev/webmcp](https://www.zapstudio.dev/webmcp)

## Motivation

[WebMCP](https://webmachinelearning.github.io/webmcp/) is a young API: a Web Machine Learning Community Group draft, not a W3C standard, shipping experimentally in Chrome/Edge as `document.modelContext`. It lets a page register JavaScript functions as "tools" — named, described, schema-typed — that an AI agent (browser-built-in, extension, or otherwise) can discover and call.

Calling `document.modelContext` directly has three rough edges for a real app. First, it crashes during server rendering — Next.js and TanStack Start both render on the server first, where there is no `document` at all. Second, unregistration is signal-based (abort a `signal` you passed at registration), which is easy to get wrong by hand for every tool a route exposes. Third, there is no batch primitive: a route with five tools means five separate `registerTool` calls and five separate cleanup paths to track.

`@zap-studio/webmcp` fixes all three: every function no-ops safely with no `document`, `registerTool` hands back a single idempotent unregister function per tool, and `createToolRegistry` groups a route's tools so they mount and unmount together. The public API stays small: `defineTool`, `registerTool`, `createToolRegistry`, and nothing else — no build step, no compiler plugin, no required dependency on the (still experimental) native API being present.

## Installation

```bash
npm install @zap-studio/webmcp
```

## Features

- **[SSR-safe by default](/webmcp/getting-started)** — every function checks for `document` first; nothing throws during Next.js or TanStack Start server rendering.
- **[`registerTool`](/webmcp/getting-started)** wraps `document.modelContext.registerTool` and returns a single idempotent unregister function, instead of making you manage an `AbortController` per tool.
- **[`defineTool`](/webmcp/getting-started)** validates a tool's `name` and `description` up front — the two fields an agent actually reads to decide whether, and how, to call the tool.
- **[`createToolRegistry`](/webmcp/registry)** batches a group of tools (e.g. everything a route exposes) behind one `mount()`/`unmount()` pair.
- **[Typed errors](/webmcp/errors)** — `WebMCPNotSupportedError` when the browser doesn't support WebMCP yet, plus `hasWebMCPSupport()` to check ahead of time.
- **No required runtime dependencies**, and no assumption that the native API is stable — this package tracks the spec, it doesn't extend it.
- **[React binding](/webmcp/react)** available separately as [`@zap-studio/webmcp-react`](https://www.npmjs.com/package/@zap-studio/webmcp-react).

## Quick Start

```ts
import { defineTool, registerTool } from "@zap-studio/webmcp";

const likeTool = defineTool({
  name: "posts_like",
  description: "Like a post by ID",
  execute: async ({ id }: { id: string }) => {
    await likePost(id);
    return { liked: true };
  },
});

const unregister = await registerTool(likeTool);
// later, e.g. on route leave
unregister();
```

## `defineTool` and `registerTool`

`defineTool` validates a tool's shape and returns it unchanged — `name` must be 1-128 characters (letters, digits, `_`, `-`, `.`), and `description` must be non-empty:

```ts
import { defineTool } from "@zap-studio/webmcp";

const shareTool = defineTool({
  name: "posts_share",
  description: "Share a post by ID",
  execute: async ({ id }: { id: string }) => ({ shared: true, id }),
});
```

`registerTool` does the actual work: it resolves to a no-op unregister function on the server, rejects with `WebMCPNotSupportedError` in a browser without WebMCP support, and otherwise registers the tool and returns an unregister function backed by an internal `AbortSignal`:

```ts
import { registerTool } from "@zap-studio/webmcp";

const unregister = await registerTool(shareTool);
unregister(); // idempotent — safe to call more than once
```

## `createToolRegistry`

Groups tools that share a lifecycle, so they mount and unmount together instead of one `registerTool` call per tool:

```ts
import { createToolRegistry } from "@zap-studio/webmcp";

const registry = createToolRegistry();
registry.add(likeTool).add(shareTool);

await registry.mount(); // registers both
registry.unmount(); // unregisters both, e.g. on route leave
```

`unmount()` is idempotent, and safe to call even if `mount()` was never called.

## Error Handling

`registerTool` rejects with `WebMCPNotSupportedError` when `document.modelContext` is unavailable. Check `hasWebMCPSupport()` first to skip registration entirely, or catch the error to degrade gracefully:

```ts
import { hasWebMCPSupport, registerTool, WebMCPNotSupportedError } from "@zap-studio/webmcp";

if (hasWebMCPSupport()) {
  await registerTool(likeTool);
}

// or:
try {
  await registerTool(likeTool);
} catch (error) {
  if (error instanceof WebMCPNotSupportedError) {
    // fall back to a regular button — no agent-callable tool here
  }
}
```

## Runtime Support

| Runtime            | Support                                                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Node.js            | SSR-safe no-op (>= 18.0.0)                                                                                                                                                                                   |
| Bun                | SSR-safe no-op (>= 1.0.0)                                                                                                                                                                                    |
| Deno               | SSR-safe no-op (>= 1.42)                                                                                                                                                                                     |
| Cloudflare Workers | SSR-safe no-op                                                                                                                                                                                               |
| Browsers           | Chrome/Edge (experimental, behind a flag); other engines via a community polyfill such as [`@mcp-b/webmcp-polyfill`](https://www.npmjs.com/package/@mcp-b/webmcp-polyfill), not a dependency of this package |

WebMCP itself is not yet a stable, cross-browser standard — this package tracks the current draft and will follow it as it evolves. Deno 1.42 is the first release that can install packages from JSR (`deno add jsr:@zap-studio/webmcp`).

## License

MIT
