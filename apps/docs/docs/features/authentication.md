# Authentication

Zap.ts provides a _robust_, _extensible_ authentication system out of the box, powered by [Better Auth](https://www.better-auth.com/).

It supports modern authentication flows, strong security defaults, and easy integration with your app.

## Overview

- **Extensible:** Add or remove providers, customize flows, and hook into authentication events.
- **Multi-provider:** Email/password, passkey, anonymous, username, admin, and organization logins.
- **Secure:** Built-in support for 2FA, email verification, and password policies.
- **Type-safe:** All authentication logic is fully typed with TypeScript.

## How authentication works?

### 1. Auth Client (client-side)

The auth client is set up in `src/zap/lib/auth/client.ts` and provides all authentication methods to your frontend.

You can use `authClient` in your React components to sign in, sign out, register, and more.

### 2. Auth Server (server-side)

The server-side auth logic is configured in `src/zap/lib/auth/server.ts` using the `betterAuth` function and your database adapter.

## Customizing Authentication

- **Add/remove providers:** Edit the `plugins` array in `authClient` and `betterAuth` setup.
- **Change password/email policies:** Update the options in your `betterAuth` config.
- **Handle auth events:** Use hooks or middleware to run custom logic on sign-in, sign-out, etc.

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/introduction).
