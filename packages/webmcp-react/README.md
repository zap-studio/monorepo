# @zap-studio/webmcp-react

React bindings for [`@zap-studio/webmcp`](https://www.npmjs.com/package/@zap-studio/webmcp): a `useWebMCPTool` hook that registers a tool with the native WebMCP API for the lifetime of a component.

Full documentation: [zapstudio.dev/webmcp/react](https://www.zapstudio.dev/webmcp/react)

## Installation

```bash
npm install @zap-studio/webmcp-react @zap-studio/webmcp
```

## Import

```ts
import { useWebMCPTool } from "@zap-studio/webmcp-react";
```

## Basic Usage

```tsx
import { useWebMCPTool } from "@zap-studio/webmcp-react";

function LikeButton({ postId }: { postId: string }) {
  useWebMCPTool(
    {
      name: "posts_like",
      description: "Like a post by ID",
      execute: async ({ id }: { id: string }) => ({ liked: await likePost(id) }),
    },
    [postId],
  );

  return <button onClick={() => likePost(postId)}>Like</button>;
}
```

Registration runs in `useEffect`, so it happens after mount, in the browser only — safe under Next.js and TanStack Start server rendering, where the hook simply registers nothing.

## Changing Tools

Pass `deps` to control when the tool re-registers — this works exactly like `useEffect`'s dependency array. With the default `[]`, the tool registers once, on mount, using the first render's `tool`:

```tsx
useWebMCPTool(
  {
    name: "posts_like",
    description: "Like a post by ID",
    execute: async ({ id }: { id: string }) => ({ liked: await likePost(id) }),
  },
  [],
);
```

Pass the values `tool` depends on to re-register when they change — for example, when a tool's `execute` closes over a prop:

```tsx
useWebMCPTool(
  {
    name: "posts_like",
    description: "Like a post by ID",
    execute: async () => ({ liked: await likePost(postId) }),
  },
  [postId],
);
```

## Unmount / Cleanup

The tool unregisters automatically when the component unmounts, or right before it re-registers on a `deps` change — no manual cleanup needed. If registration is still pending when the component unmounts, `useWebMCPTool` unregisters it as soon as it resolves instead of leaking a dangling tool.

## Handling Errors

Registration failures — most commonly an unsupported browser — are caught internally and surfaced through the returned `error`, not thrown, so a missing agent-callable tool never crashes the component tree:

```tsx
function LikeButton({ postId }: { postId: string }) {
  const { error } = useWebMCPTool(
    {
      name: "posts_like",
      description: "Like a post by ID",
      execute: async ({ id }: { id: string }) => ({ liked: await likePost(id) }),
    },
    [postId],
  );

  return (
    <button onClick={() => likePost(postId)}>Like{error ? " (agent tool unavailable)" : ""}</button>
  );
}
```

## See Also

- [`@zap-studio/webmcp`](https://www.npmjs.com/package/@zap-studio/webmcp) — the framework-agnostic core this hook wraps
- [Getting Started](/webmcp/getting-started) — `defineTool`, `registerTool`, and SSR safety
- [Tool Registry](/webmcp/registry) — batch-register a route's tools outside of React

## License

MIT
