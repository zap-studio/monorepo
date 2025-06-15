# Type-Safe API

**Zap.ts** leverages [oRPC](https://orpc.unnoq.com/) to provide type-safe API procedures between the frontend and backend.

Built on top of **Next.js API routes**, **oRPC** ensures _seamless_ communication with **OpenAPI** spec support, making it a powerful alternative to [**tRPC**](https://trpc.io/).

For **data fetching**, **mutations** and **caching** on the client, **Zap.ts** uses [SWR](https://swr.vercel.app/) for a _fast_ and _reactive_ developer experience.

## Overview

- **Type-safe:** All procedures and inputs are validated with Zod schemas and TypeScript types.
- **OpenAPI-ready:** oRPC can generate OpenAPI specs for your endpoints.
- **React-friendly:** Hooks are generated for easy data fetching with SWR or React Query.
- **Extensible:** Add new procedures, middleware, and custom logic with minimal boilerplate.

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

3. **Register it for server-side usage (optional, for internal/server-to-server calls):**

```ts
// src/zap/lib/orpc/server.ts
import { createRouterClient } from "@orpc/server";
import { hello } from "@/zap/rpc/procedures/hello.rpc";

export const createOrpcServer = (headers: Headers) => {
  return createRouterClient(
    {
      hello,
      // ...other procedures
    },
    {
      context: {
        headers,
      },
    },
  );
};
```

4. **Create a hook:**

```ts
// src/hooks/use-hello.ts
import { useORPC } from "@/stores/orpc.store";
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

## References

### `router`

The main router that registers all procedures.

```ts
// src/rpc/router.ts
import { greet } from "./procedures/greet.rpc";
export const router = { greet };
```

---

### `orpc`

The `orpc` object provides React Query-compatible utilities for calling your oRPC procedures from the client, making it easy to fetch and mutate data in your React components.

```ts
// src/zap/lib/orpc.ts
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { RouterClient } from "@orpc/server";
import { router } from "@/rpc/router";
import { createORPCReactQueryUtils } from "@orpc/react-query";

export const link = new RPCLink({ url: "/rpc" });
export const client: RouterClient<typeof router> = createORPCClient(link);
export const orpc = createORPCReactQueryUtils(client);
```

---

### `middlewares`

Middleware can be used to add authentication, logging, or other logic to your procedures.

```ts
// src/rpc/middlewares.ts
import { os } from "@orpc/server";
import { Effect } from "effect";
import { auth } from "@/zap/lib/auth/server";

export const base = os
  .$context<{ headers: Headers }>()
  .errors({ UNAUTHORIZED: {} });

export const authMiddleware = base.middleware(
  async ({ context, next, errors }) => {
    const program = Effect.gen(function* (_) {
      const session = yield* _(
        Effect.tryPromise({
          try: () => auth.api.getSession({ headers: context.headers }),
          catch: (error) => new Error(`Failed to get session: ${error}`),
        }),
      );

      if (!session) {
        return yield* _(
          Effect.fail(
            errors.UNAUTHORIZED({
              message: "Unauthorized access",
            }),
          ),
        );
      }

      return yield* _(
        Effect.try({
          try: () =>
            next({
              context: {
                session,
                headers: context.headers,
              },
            }),
        }),
      );
    });

    return Effect.runPromise(
      program.pipe(
        Effect.catchAll((error: unknown) => {
          return Effect.fail(error);
        }),
      ),
    );
  },
);
```

---

### `RPCHandler`

Set up the oRPC handler for your API routes on the server:

```ts
// src/app/(api)/rpc/[[...rest]]/route.ts
import { RPCHandler } from "@orpc/server/fetch";
import { router } from "@/rpc/router";

const handler = new RPCHandler(router);

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, {
    prefix: "/rpc",
    context: {
      headers: request.headers,
    },
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
```

---

### `createOrpcServer`

You can set up server-side oRPC procedure handlers for internal or server-to-server calls using the oRPC server utilities.

```ts
// src/zap/lib/orpc/server.ts
import { createRouterClient } from "@orpc/server";

import { feedbacks } from "@/zap/rpc/procedures/feedbacks.rpc";
import { users } from "@/zap/rpc/procedures/users.rpc";

const { getAverageRating } = feedbacks;
const { getNumberOfUsers } = users;

export const createOrpcServer = (headers: Headers) => {
  return createRouterClient(
    {
      getAverageRating,
      getNumberOfUsers,
    },
    {
      context: {
        headers,
      },
    },
  );
};
```