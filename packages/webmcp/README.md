# @zap-studio/webmcp

A framework-agnostic, SSR-safe wrapper around the native WebMCP `document.modelContext` API, with a batch tool registry for exposing JavaScript tools to AI agents.

Full documentation: [docs/webmcp](https://github.com/zap-studio/monorepo/tree/main/docs/webmcp)

## Installation

```bash
npm install @zap-studio/webmcp
```

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
