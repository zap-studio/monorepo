# API Procedures

Zap.ts leverages [oRPC](https://orpc.unnoq.com/) to provide type-safe API procedures between the frontend and backend. Built on top of Next.js API routes, oRPC ensures seamless communication with OpenAPI spec support, making it a powerful alternative to tRPC. This guide explains how oRPC is set up in Zap.ts and how to use it in your project.

## Why oRPC?

oRPC enhances your development experience with:

- **Type Safety**: End-to-end TypeScript support for API calls, reducing runtime errors.
- **Simplicity**: Define procedures on the server and call them from the client with minimal boilerplate.
- **OpenAPI Support**: Generate API documentation or connect to external tools effortlessly.
- **Integration**: Works naturally with Next.js and Zap.ts modern stack.

This makes oRPC ideal for building robust APIs for features like user management, data fetching, or AI interactions.

## How oRPC Works in Zap.ts

Zap.ts pre-configures oRPC with a client, server router, and React Query utilities:

1. **Server Router**: Defined in `src/rpc/router.ts`, it specifies the available procedures.
2. **Client Setup**: `src/lib/orpc.ts` creates an oRPC client with a fetch link to `/rpc`, exposing type-safe methods.
3. **React Query Integration**: The `orpc` utility in `src/lib/orpc.ts` pairs oRPC with React Query, and thus SWR (via `useSWR`) for data fetching and caching.
4. **Hook Example**: `src/hooks/use-example.ts` demonstrates calling an oRPC procedure with SWR.

## oRPC Setup in Zap.ts

Here’s how oRPC is configured:

### Client Configuration

The oRPC client is set up in `src/lib/orpc.ts`:

```ts
// src/lib/orpc.ts
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { RouterClient } from "@orpc/server";
import { router } from "@/rpc/router";
import { createORPCReactQueryUtils } from "@orpc/react-query";

export const link = new RPCLink({
  url: "http://localhost:3000/rpc", // Adjust for production
});

export const client: RouterClient<typeof router> = createORPCClient(link);

export const orpc = createORPCReactQueryUtils(client);
```

- **`link`**: Connects to the `/rpc` endpoint (served by Next.js API routes).
- **`client`**: Provides type-safe access to the router’s procedures.
- **`orpc`**: Wraps the client with React Query utilities for hooks like `useSWR`.

### Example Hook

The `useExample` hook demonstrates calling an oRPC procedure:

```ts
// src/hooks/use-example.ts
import { useORPC } from "@/stores/orpc.store";
import useSWR from "swr";

export const useExample = () => {
  const orpc = useORPC();
  return useSWR(orpc.example.key(), orpc.example.queryOptions().queryFn);
};
```

- **`useORPC`**: Retrieves the oRPC client from a Zustand store.
- **`useSWR`**: Fetches data using the procedure’s key and query function.

### Server Router

The router is defined in `src/rpc/router.ts` (not fully provided). A basic example might look like:

```ts
// src/rpc/router.ts
import { example } from "./procedures/example.rpc";

export const router = {
  example,
};
```

This defines an `example` procedure that returns a simple object.

## Using oRPC in Your Project

Zap.ts provides the oRPC foundation—here’s how to utilize and extend it.

### 1. Calling an Existing Procedure

Use the pre-configured `useExample` hook in your components:

```tsx
"use client";

import { useExample } from "@/hooks/use-example";

export default function ExampleComponent() {
  const { data, error, isLoading } = useExample();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return <p>{data?.message}</p>;
}
```

- **`data`**: The response from the `example` procedure.
- **`error`**: Any fetch errors.
- **`isLoading`**: Loading state from SWR.

### 2. Defining a New Procedure

Add a new procedure to the server router:

1. **Update the Router**:

   ```ts
   // src/rpc/router.ts
   import { example } from "./procedures/example.rpc";
   import { greet } from "./procedures/greet.rpc";

   export const router = {
     example,
     greet,
   };
   ```

   ```ts
   // src/rpc/procedures/greet.rpc.ts
   import { authMiddleware, base } from "../middlewares";

   export const example = base
     .use(authMiddleware)
     .handler(async ({ context }) => {
       const session = context.session;
       return { message: `Hello, ${session.user.name}!` };
     });
   ```

2. **Create a Hook**:

   ```ts
   // src/hooks/use-greet.ts
   import { useORPC } from "@/stores/orpc.store";
   import useSWR from "swr";

   export const useGreet = () => {
     const orpc = useORPC();
     return useSWR(orpc.greet.key(), orpc.greet.queryOptions().queryFn);
   };
   ```

3. **Use in a Component**:

   ```tsx
   "use client";

   import { useGreet } from "@/hooks/use-greet";

   export default function GreetComponent() {
     const { data, error, isLoading } = useGreet();

     if (isLoading) return <p>Loading...</p>;
     if (error) return <p>Error: {error.message}</p>;
     return <p>{data?.message}</p>;
   }
   ```

### 3. Accessing the Client Directly

For custom logic, use the `client` directly:

```ts
import { client } from "@/lib/orpc";

async function fetchGreeting(name: string) {
  const response = await client.greet.query();
  console.log(response.message); // "Hello, [name]!"
}
```

## Using Zap CLI

Zap.ts provides a CLI command to generate new API procedures, including the procedure file, router update, and a corresponding hook.

#### Command

Run the following command in your project directory to create a new procedure:

```bash
npm run zap create procedure <procedureName>
```

Alternatively, you can use the full command:

```bash
npx create-zap-app@latest create procedure <procedureName>
```

Replace `<procedureName>` with your desired procedure name (e.g., `getUserData`).

#### What It Does

This command:

1. Creates a new procedure file at `src/rpc/procedures/<procedure-name>.rpc.ts`.
2. Updates the router in `src/rpc/router.ts` to include the new procedure.
3. Generates a hook at `src/hooks/use-<procedure-name>.ts` for frontend use.

#### Example

```bash
npm run zap create procedure getUserData
```

This generates:

- `src/rpc/procedures/get-user-data.rpc.ts`:

  ```ts
  import { base } from "../middlewares";

  export const getUserData = base.handler(async () => {
    return { message: "Hello from getUserData" };
  });
  ```

- Updates `src/rpc/router.ts` to include `getUserData`.
- `src/hooks/use-get-user-data.ts`:

  ```ts
  "use client";

  import { useORPC } from "@/stores/orpc.store";
  import useSWR from "swr";

  export const useGetUserData = () => {
    const orpc = useORPC();
    return useSWR(
      orpc.getUserData.key(),
      orpc.getUserData.queryOptions().queryFn
    );
  };
  ```

### Using the Procedure

In your frontend code, use the generated hook:

```tsx
import { useGetUserData } from "@/hooks/use-get-user-data";

export default function UserDataComponent() {
  const { data, error } = useGetUserData();

  if (error) return <div>Error loading data</div>;
  if (!data) return <div>Loading...</div>;

  return <div>{data.message}</div>;
}
```

## Troubleshooting

- **Procedure Not Found**: Ensure the procedure is defined in `router.ts` and matches the client call.
- **Type Errors**: Verify input schemas (e.g., `z.string()`) align with your data.
- **Fetch Errors**: Check the `/rpc` endpoint URL and server logs.

## Learning More

Zap.ts provides a basic oRPC setup. For advanced features (e.g., mutations, middleware, OpenAPI generation), refer to the [official oRPC documentation](https://orpc.unnoq.com/).

## Why oRPC in Zap.ts?

- **Type Safety**: Catch errors at compile time, not runtime.
- **Flexibility**: OpenAPI support for broader integrations.
- **Speed**: Pre-configured for rapid API development.

Zap into type-safe APIs today!
