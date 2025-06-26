# Type-Safe API

Zap.ts leverages [oRPC](https://orpc.unnoq.com/) to provide type-safe API procedures between the frontend and backend.

Built on top of **Next.js API routes**, **oRPC** ensures _seamless_ communication with **OpenAPI** spec support, making it a powerful alternative to [**tRPC**](https://trpc.io/).

For **data fetching**, **mutations** and **caching** on the client, Zap.ts uses [SWR](https://swr.vercel.app/) for a _fast_ and _reactive_ developer experience.

Recently, it has also been [optimized](https://orpc.unnoq.com/docs/best-practices/optimize-ssr) for **Server-Side Rendering** (SSR), with a _client-side fallback_.

## Overview

- **Extensible:** Add new procedures, middleware, and custom logic with minimal boilerplate.
- **OpenAPI-ready:** oRPC can generate OpenAPI specs for your endpoints.
- **React-friendly:** Hooks are generated for easy data fetching with SWR or React Query.
- **Type-safe:** All procedures and inputs are validated with Zod schemas and TypeScript types.

## Server vs. Client

### 1. Defining procedures (server-side)

- Procedures are defined in `src/rpc/procedures/` as `.rpc.ts` files.
- Each procedure uses Zod schemas for input validation and can include middleware for authentication or other logic.
- All procedures are registered in the main router (`src/rpc/router.ts`).

### 2. Consuming procedures (client-side)

- The oRPC client is set up in `src/zap/lib/orpc.ts`.
- Each procedure is easily transformed into a hook, making it easy to fetch or mutate data in your React components.

## Adding a new procedure

1. **Create the procedure:**

```ts
// src/rpc/procedures/hello.rpc.ts
import { base } from "../middlewares";
import { z } from "zod/v4";

export const hello = base
  .input(z.object({ name: z.string() }))
  .handler(async ({ input }) => {
    return { message: `Hello, ${input.name}!` };
  });
```

2. **Register it in the router (client/server shared):**

```ts
// src/rpc/router.ts
import { hello } from "./procedures/hello.rpc";
export const router = { hello /* ...other procedures */ };
```

3. **Server-side usage (optional):**

```ts
// src/app/some-page/page.tsx
import { router } from "@/rpc/router";

export default async function SomePage() {
  const data = await router.hello(); // Server-side query
  return <div>{data.message}</div>;
}
```

4. **Client-side usage, create a hook:**

```ts
// src/hooks/use-hello.ts
import { useORPC } from "@/zap/stores/orpc.store";
import useSWR from "swr";

export const useHello = (input) => {
  const orpc = useORPC();
  return useSWR(orpc.hello.key(input), orpc.hello.queryOptions(input).queryFn);
};
```

5. **Consume the hook:**

```tsx
"use client";
import { useHello } from "@/hooks/use-hello";

export default function HelloComponent() {
  const { data, error, isLoading } = useHello({ name: "Zap" });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return <p>{data?.message}</p>;
}
```

## Advanced Features

- **Middleware:** Add authentication, logging, or other logic using oRPC middleware.
- **Mutations:** Use `useMutation` for write operations.
- **OpenAPI:** Generate OpenAPI specs for your API.

For more, see the [oRPC documentation](https://orpc.unnoq.com/).
