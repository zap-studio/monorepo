# Type-Safe API

Zap.ts leverages [oRPC](https://orpc.unnoq.com/) to provide type-safe API procedures between the frontend and backend.

Built on top of **Next.js API routes**, **oRPC** ensures _seamless_ communication with **OpenAPI** spec support, making it a powerful alternative to [**tRPC**](https://trpc.io/).

For **data fetching**, **mutations** and **caching** on the client, Zap.ts uses [SWR](https://swr.vercel.app/) for a _fast_ and _reactive_ developer experience.

## Overview

- **Extensible:** Add new procedures, middleware, and custom logic with minimal boilerplate.
- **OpenAPI-ready:** oRPC can generate OpenAPI specs for your endpoints.
- **React-friendly:** Hooks are generated for easy data fetching with SWR or React Query.
- **Type-safe:** All procedures and inputs are validated with Zod schemas and TypeScript types.

## Server vs. Client

### 1. Defining Procedures (server-side)

- Procedures are defined in `src/rpc/procedures/` as `.rpc.ts` files.
- Each procedure uses Zod schemas for input validation and can include middleware for authentication or other logic.
- All procedures are registered in the main router (`src/rpc/router.ts`).

### 2. Consuming Procedures (client-side)

- The oRPC client is set up in `src/zap/lib/orpc.ts`.
- Each procedure is easily transformed into a hook, making it easy to fetch or mutate data in your React components.

## Error Handling Architecture

Zap.ts implements a **centralized error handling system** that works seamlessly from server to client. This ensures consistent error reporting, user feedback, and debugging across your entire application.

### Server-Side Error Flow

**1. Custom Error Classes**

The foundation starts with typed error classes in `src/zap/lib/api/errors.ts`:

```ts
// Base error class with HTTP status codes
export class BaseError extends Error {
  statusCode: HttpStatusCode;
  code: string;
  
  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// Specific error types
export class UnauthorizedError extends BaseError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ValidationError extends BaseError {
  constructor(message = "Validation failed") {
    super(message, 400, "VALIDATION_ERROR");
  }
}
```

**2. Handler Wrappers**

All server-side code is wrapped with error handlers in `src/zap/lib/api/handlers.ts`:

```ts
// RPC procedures
export const saveUser = base
  .input(SaveUserSchema)
  .handler(withRpcHandler(async ({ input }) => {
    // Your business logic here
    if (!input.email) {
      throw new ValidationError("Email is required");
    }
    return await userService.save(input);
  }));

// API routes  
export async function POST(request: Request) {
  return withApiHandler(async () => {
    const body = await request.json();
    // Business logic
    return Response.json({ success: true });
  })();
}
```

**3. Automatic Error Processing**

The handlers automatically:
- Generate correlation IDs for tracking
- Log errors with context
- Transform errors to consistent response format
- Include stack traces in development

### Client-Side Error Flow

**1. Centralized Error Handler**

All client errors flow through `handleClientError` in `src/zap/lib/api/client.ts`:

```ts
export function handleClientError(error: unknown, fallbackMessage = "Something went wrong") {
  let title = "Error";
  let description = fallbackMessage;

  if (error instanceof BaseError) {
    title = error.name;
    description = error.message;
  } else if (error instanceof Error) {
    description = error.message;
  }

  // Show user-friendly toast notification
  toast.error(description, {
    description: title !== "Error" ? title : undefined,
  });

  // Log detailed error info in development
  if (DEV) {
    console.error(`[Client Error] ${title}: ${description}`, error);
  }
}
```

**2. Custom SWR Hooks**

Zap.ts provides custom hooks that integrate error handling automatically:

```ts
// For data fetching
export function useZapQuery<Data>(
  key: string,
  fetcher: () => Promise<Data>,
  options = {}
) {
  const { skipErrorHandling = true, ...swrOptions } = options;
  
  return useSWR(key, fetcher, {
    ...swrOptions,
    onError: (error) => {
      if (!skipErrorHandling) {
        handleClientError(error);
      }
    },
  });
}

// For mutations
export function useZapMutation<Data>(
  key: string,
  fetcher: (arg: unknown) => Promise<Data>,
  options = {}
) {
  const { skipErrorHandling = false, successMessage, ...swrOptions } = options;
  
  return useSWRMutation(key, fetcher, {
    ...swrOptions,
    onSuccess: (data) => {
      if (successMessage) {
        handleSuccess(successMessage);
      }
    },
    onError: (error) => {
      if (!skipErrorHandling) {
        handleClientError(error);
      }
    },
  });
}

// For immutable data (cached permanently)
export function useZapImmutable<Data>(
  key: string,
  fetcher: () => Promise<Data>,
  options = {}
) {
  // Similar implementation with useSWRImmutable
}
```

### Complete Error Flow Example

Here's a complete example showing the error flow from a user action to display:

**1. RPC Procedure (Server)**

```ts
// src/rpc/procedures/users.rpc.ts
import { authMiddleware, base } from "@/rpc/middlewares";
import { withRpcHandler } from "@/zap/lib/api/handlers";
import { UnauthorizedError, ValidationError } from "@/zap/lib/api/errors";

const updateProfile = base
  .use(authMiddleware)
  .input(z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
  }))
  .handler(withRpcHandler(async ({ input, context }) => {
    // Validation happens automatically via Zod schema
    
    // Business logic validation
    const existingUser = await findUserByEmail(input.email);
    if (existingUser && existingUser.id !== context.session.user.id) {
      throw new ValidationError("Email already taken");
    }

    // Database operation that might fail
    try {
      return await updateUser(context.session.user.id, input);
    } catch (dbError) {
      throw new InternalServerError("Failed to update profile", dbError);
    }
  }));
```

**2. Client Hook**

```ts
// src/hooks/use-update-profile.ts
import { useZapMutation } from "@/zap/lib/api/hooks/use-zap-mutation";
import { useORPC } from "@/zap/stores/orpc.store";

export function useUpdateProfile() {
  const orpc = useORPC();
  
  return useZapMutation(
    'update-profile',
    async (_, { arg }) => orpc.users.updateProfile.call(arg),
    {
      successMessage: "Profile updated successfully!",
      // skipErrorHandling: false (default - errors will be shown as toasts)
    }
  );
}
```

**3. React Component**

```tsx
// src/components/profile-form.tsx
"use client";
import { useUpdateProfile } from "@/hooks/use-update-profile";

export function ProfileForm() {
  const updateProfile = useUpdateProfile();
  
  const handleSubmit = async (data) => {
    try {
      await updateProfile.trigger(data);
      // Success toast automatically shown
    } catch (error) {
      // Error toast automatically shown via handleClientError
      // Could add custom error handling here if needed
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button 
        type="submit" 
        disabled={updateProfile.isMutating}
      >
        {updateProfile.isMutating ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
```

### Error Flow Summary

1. **Server Error** → Handler catches → Transforms to consistent format → Returns HTTP response
2. **Client Receives** → SWR hook catches → `handleClientError` processes → Toast notification shown
3. **User Sees** → Friendly error message → Developer sees detailed logs in console (dev mode)

### Benefits

- **Consistent UX**: All errors show user-friendly toast notifications
- **Developer Experience**: Detailed logging and correlation IDs for debugging  
- **Type Safety**: Strongly typed errors that can be caught and handled appropriately
- **Centralized**: Single place to modify error handling behavior
- **Automatic**: No need to wrap every API call in try/catch blocks

## Adding a New Procedure

1. **Create the procedure:**

```ts
// src/rpc/procedures/hello.rpc.ts
import { base } from "../middlewares";
import { z } from "zod";

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
import { useZapImmutable } from "@/zap/lib/api/hooks/use-zap-immutable";

export const useHello = (input) => {
  const orpc = useORPC();
  return useZapImmutable(
    orpc.hello.key(input), 
    orpc.hello.queryOptions(input).queryFn
  );
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

- The oRPC client is set up in `src/zap/lib/orpc.ts`.
- Each procedure is easily transformed into a hook, making it easy to fetch or mutate data in your React components.

## Adding a New Procedure

1. **Create the procedure:**

```ts
// src/rpc/procedures/hello.rpc.ts
import { base } from "../middlewares";
import { z } from "zod";

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
