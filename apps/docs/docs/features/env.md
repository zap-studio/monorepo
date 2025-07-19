# Environment Variables

Zap.ts provides a structured approach to managing environment variables for both _client-side_ and _server-side_ usage, ensuring security, type safety, and ease of configuration.

## Overview

- **Client-side**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the client, ensuring sensitive data remains secure.
- **Configuration**: Variables are stored in `.env` files, generated automatically by the `create-zap-app` CLI.
- **Server-side**: Environment variables are securely accessed using Node.js's `process.env` and validated with type safety.
- **Type Safety**: Environment variables are defined and validated using [TypeScript](https://www.typescriptlang.org/) and [Zod](https://zod.dev/) for robust typing.

## Server vs. Client

There are two files: `env.server.ts` and `env.client.ts`.

The server file contains variables that are only accessible on the server side, while the client file contains environment variables that are available across all _runtimes_ (both browser/client and server environments).

## How it works?

### 1. Environment Variable Storage

Environment variables are stored in `.env` files, typically `.env` or `.env.local`, which are loaded by Next.js during _build time_.

To make it easier for you, the `create-zap-app` CLI generates an `.env` file with required variables during project setup:

```ts
// Example .env content
BETTER_AUTH_SECRET="your_secret_here"
DATABASE_URL="postgresql://fake_user:fake_password@ep-example-database.us-west-1.aws.neon.tech/fake_db?sslmode=require"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your_vapid_public_key_here"
ZAP_MAIL="your_email_here"
```

- **Sensitive variables**: Variables like `BETTER_AUTH_SECRET` or `DATABASE_URL` are server-only and never exposed to the client.
- **Public variables**: Variables prefixed with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_VAPID_PUBLIC_KEY`) are bundled into the client-side JavaScript and can be accessed in the browser.

### 2. Server-side Environment Variables

Server-side environment variables are accessed via `process.env` and are validated using Zod schemas for type safety.

Zap.ts provides two utility files to manage this:

- **`src/lib/env.server.ts`**: Defines and validates server-only environment variables.
- **`src/lib/env.client.ts`**: Defines and validates client and server environment variables (such as those prefixed with `NEXT_PUBLIC_`).

Then, you can import `ENV` from `@/lib/env.server.ts` in server-side code (e.g., API routes, server actions, or database queries).

```ts
import { ENV } from "@/lib/env.server";

const dbConfig = {
  url: ENV.DATABASE_URL,
  ssl: "require",
};
```

Since `env.server.ts` is only imported in server-side contexts, sensitive variables remain secure and are never included in client-side bundles.

### 3. Client-side Environment Variables

Client-side environment variables must be prefixed with `NEXT_PUBLIC_` to be included in the client bundle by Next.js. These are validated in `src/lib/env.client.ts`.

And now, you can also import `ENV` from `src/lib/env.client.ts` in client-side components, hooks and even server-side code.

```ts
import { ENV } from "@/lib/env.client";

export function PushNotifications() {
  const vapidKey = ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  // Use vapidKey for Web Push API
}
```

Only include variables in `env.client.ts` that are safe to expose to the browser. Never include sensitive data like API keys or database credentials.

### 4. Type Safety and Validation

Both `env.server.ts` and `env.client.ts` use Zod to validate environment variables at runtime, ensuring that:

- Required variables are present.
- TypeScript types are inferred automatically for use throughout the application.
- Variables conform to expected formats (e.g., URLs, emails, or minimum lengths).

If a variable is missing or invalid, the application will throw an error during startup, preventing runtime issues.

Example error output:

```
ZodError: [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": ["DATABASE_URL"],
    "message": "Required"
  }
]
```

### 5. Generating `.env` Files

The `create-zap-app` CLI generates an `.env` file with placeholders for required variables.

- **Placeholders**: Provides sample values or placeholders for other variables, like `DATABASE_URL` or `ZAP_MAIL`.
- **Secure secrets**: Automatically generates secure values for `BETTER_AUTH_SECRET` and `ENCRYPTION_KEY` using `generateSecret()`.

### 6. Best Practices

- **Never commit `.env` files**: The `.gitignore` file includes `.env*` to prevent accidental commits. Use `.env.example` to share sample configurations.
- **Use `.env.local` for development**: Next.js prioritizes `.env.local` for local development, allowing you to override variables without modifying `.env`.
- **Keep client variables minimal**: Only expose variables that are absolutely necessary for client-side functionality.
