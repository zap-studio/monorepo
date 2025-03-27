# Authentication

Zap.ts provides a robust authentication system powered by [Better Auth](https://better-auth.com/), a flexible and framework-agnostic solution. With Better Auth, you get secure email/password login, social providers (like Google), and plugin support for features like two-factor authentication—all pre-integrated into Zap.ts. This guide explains how authentication works, walks you through a basic setup, and shows you how to configure it.

## Why Better Auth in Zap.ts?

- **Flexibility**: Works with any framework and database, avoiding vendor lock-in.
- **Security**: Built-in protections for passwords, sessions, and OAuth.
- **Extensibility**: Plugins for two-factor, magic links, and more.
- **Pre-Configured**: Zap.ts sets it up so you can start zapping right away.

## How Authentication Works in Zap.ts

Zap.ts integrates Better Auth with client-side and server-side components:

1. **Server-Side**: `src/lib/auth-server.ts` defines the authentication logic, including providers and plugins.
2. **Client-Side**: `src/lib/auth-client.ts` provides hooks and utilities to interact with the auth system.
3. **Database**: Syncs with your database (e.g., Neon PostgreSQL via Drizzle) for user data.

## Configuring Authentication

Zap.ts comes with a default setup, but you’ll need to configure a few essentials.

### 1. Set Environment Variables

Add these to your `.env.local`:

```
BETTER_AUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

- **`BETTER_AUTH_SECRET`**: A secure key for session encryption (generate with `openssl rand -base64 32`).
- **`GOOGLE_CLIENT_ID`** and **`GOOGLE_CLIENT_SECRET`**: Get these from the [Google Cloud Console](https://console.cloud.google.com/) for OAuth.

### 2. Review Server Configuration

The server setup is in `src/lib/auth-server.ts`:

```ts
// src/lib/auth-server.ts
import { betterAuth } from "better-auth";
import {
  twoFactor,
  username,
  anonymous,
  magicLink,
  emailOTP,
  admin,
  organization,
} from "better-auth/plugins";
import {
  MAXIMUM_PASSWORD_LENGTH,
  MAXIMUM_USERNAME_LENGTH,
  MINIMUM_PASSWORD_LENGTH,
  MINIMUM_USERNAME_LENGTH,
} from "@/data/settings";
import { passkey } from "better-auth/plugins/passkey";

export const auth = betterAuth({
  appName: "Zap.ts",
  emailAndPassword: {
    enabled: true,
    minPasswordLength: MINIMUM_PASSWORD_LENGTH, // 8
    maxPasswordLength: MAXIMUM_PASSWORD_LENGTH, // 128
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    twoFactor(),
    username({
      minUsernameLength: MINIMUM_USERNAME_LENGTH, // 3
      maxUsernameLength: MAXIMUM_USERNAME_LENGTH, // 20
      usernameValidator: (username) => username !== "admin",
    }),
    anonymous(),
    magicLink({
      sendMagicLink: async (email, magicLink) => {
        console.log("send magic link to the user", { email, magicLink });
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log("sendVerificationOTP", { email, otp, type });
      },
    }),
    passkey(),
    admin(),
    organization(),
  ],
});
```

- **Customization**: Update `appName`, tweak password/username lengths in `src/data/settings.ts`, or enable/disable providers/plugins as needed.
- **OAuth**: Add more social providers (e.g., GitHub) by extending `socialProviders`.

### 3. Check Client Configuration

The client is set up in `src/lib/auth-client.ts`:

```ts
// src/lib/auth-client.ts
import {
  twoFactorClient,
  usernameClient,
  anonymousClient,
  magicLinkClient,
  emailOTPClient,
  passkeyClient,
  adminClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // Update for production
  plugins: [
    twoFactorClient(),
    usernameClient(),
    anonymousClient(),
    magicLinkClient(),
    emailOTPClient(),
    passkeyClient(),
    adminClient(),
    organizationClient(),
  ],
});

export type Session = typeof authClient.$Infer.Session;
```

- **`baseURL`**: Change to your production URL after deployment (e.g., `https://your-app.vercel.app`).
- **Plugins**: Match the server’s plugins for full functionality.

## Troubleshooting

- **Secret Missing**: Ensure `BETTER_AUTH_SECRET` is set in `.env.local`.
- **Session Issues**: Check `baseURL` in `auth-client.ts` matches your app’s URL.

## Learning More

Zap.ts provides a solid Better Auth foundation. For advanced features like two-factor authentication, magic links, or custom providers, explore the [Better Auth documentation](https://better-auth.com/docs).

## Why Authentication in Zap.ts?

- **Secure**: Better Auth handles the heavy lifting with best practices.
- **Fast**: Pre-configured for instant use.
- **Flexible**: Extend it as your app grows.

Zap into secure authentication today!
