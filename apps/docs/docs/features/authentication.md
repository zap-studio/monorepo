# Authentication

**Zap.ts** provides a _robust_, _extensible_ authentication system out of the box, powered by [Better Auth](https://www.better-auth.com/).

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

## Customizing authentication

- **Add/remove providers:** Edit the `plugins` array in `authClient` and `betterAuth` setup.
- **Change password/email policies:** Update the options in your `betterAuth` config.
- **Handle auth events:** Use hooks or middleware to run custom logic on sign-in, sign-out, etc.

For more details, see the [Better Auth documentation](https://www.better-auth.com/docs/introduction).

## References

### `authClient`

```ts
// src/zap/lib/auth/client.ts
import {
  adminClient,
  anonymousClient,
  organizationClient,
  passkeyClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { BASE_URL } from "@/zap.config";

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  plugins: [
    twoFactorClient(),
    usernameClient(),
    anonymousClient(),
    passkeyClient(),
    adminClient(),
    organizationClient(),
  ],
});

export type Session = typeof authClient.$Infer.Session;
```

---

###  `auth`

```ts
// src/zap/lib/auth/server.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  anonymous,
  organization,
  twoFactor,
  username,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";

import { SETTINGS } from "@/data/settings";
import { db } from "@/db";
import {
  sendForgotPasswordMail,
  sendVerificationEmail,
} from "@/zap/actions/emails.action";
import { canSendEmail, updateLastEmailSent } from "@/zap/lib/resend/rate-limit";

export const auth = betterAuth({
  appName: "Zap.ts",
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: SETTINGS.AUTH.MINIMUM_PASSWORD_LENGTH,
    maxPasswordLength: SETTINGS.AUTH.MAXIMUM_PASSWORD_LENGTH,
    requireEmailVerification: SETTINGS.AUTH.REQUIRE_MAIL_VERIFICATION,
    sendResetPassword: async ({ user, url }) => {
      const { canSend, timeLeft } = await canSendEmail(user.id);
      if (!canSend) {
        throw new Error(
          `Please wait ${timeLeft} seconds before requesting another password reset email.`,
        );
      }

      await sendForgotPasswordMail({
        recipients: [user.email],
        subject: `${SETTINGS.MAIL.PREFIX} - Reset your password`,
        url,
      });

      await updateLastEmailSent(user.id);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const { canSend, timeLeft } = await canSendEmail(user.id);
      if (!canSend) {
        throw new Error(
          `Please wait ${timeLeft} seconds before requesting another password reset email.`,
        );
      }

      await sendVerificationEmail({
        recipients: [user.email],
        subject: `${SETTINGS.MAIL.PREFIX} - Verify your email`,
        url,
      });

      await updateLastEmailSent(user.id);
    },
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
      minUsernameLength: SETTINGS.AUTH.MINIMUM_USERNAME_LENGTH,
      maxUsernameLength: SETTINGS.AUTH.MAXIMUM_USERNAME_LENGTH,
      usernameValidator: (username) => username !== "admin",
    }),
    anonymous(),
    passkey(),
    admin(),
    organization(),
  ],
});
```

### `getSession`

```ts
// src/zap/actions/authenticated.action.ts
import { auth } from "@/zap/lib/auth/server";
import { headers } from "next/headers";

export const getSession = async () => {
  return Effect.runPromise(
    Effect.tryPromise({
      try: async () => {
        const headersList = await headers();
        return auth.api.getSession({ headers: headersList });
      },
      catch: (e) => e,
    }),
  );
};
```