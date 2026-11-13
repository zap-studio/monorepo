# @zap-studio/webmcp-react

React bindings for [`@zap-studio/webmcp`](https://www.npmjs.com/package/@zap-studio/webmcp): a `useWebMCPTool` hook that registers a tool with the native WebMCP API for the lifetime of a component.

Full documentation: [docs/webmcp/react](https://github.com/zap-studio/monorepo/blob/main/docs/webmcp/react.md)

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

## License

MIT
