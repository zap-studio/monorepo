import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
  admin,
  anonymous,
  haveIBeenPwned,
  organization,
  twoFactor,
  username,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";

import { SETTINGS } from "@/data/settings";
import { db } from "@/db";
import { SERVER_ENV } from "@/lib/env.server";
import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { client } from "@/zap/lib/orpc/client";

export const auth = betterAuth({
  appName: "Zap.ts",
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: SETTINGS.AUTH.MINIMUM_PASSWORD_LENGTH,
    maxPasswordLength: SETTINGS.AUTH.MAXIMUM_PASSWORD_LENGTH,
    requireEmailVerification: SETTINGS.AUTH.REQUIRE_MAIL_VERIFICATION,
    sendResetPassword: async ({ user, url }) => {
      const { canSend, timeLeft } = await client.mails.canSendMail({
        userId: user.id,
      });
      if (!canSend) {
        throw new Error(
          `Please wait ${timeLeft} seconds before requesting another password reset email.`,
        );
      }

      await client.mails.sendForgotPasswordMail({
        recipients: [user.email],
        subject: `${SETTINGS.MAIL.PREFIX} - Reset your password`,
        url,
      });

      await client.mails.updateLastTimestampMailSent({ userId: user.id });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const { canSend, timeLeft } = await client.mails.canSendMail({
        userId: user.id,
      });
      if (!canSend) {
        throw new Error(
          `Please wait ${timeLeft} seconds before requesting another password reset email.`,
        );
      }

      await client.mails.sendVerificationMail({
        recipients: [user.email],
        subject: `${SETTINGS.MAIL.PREFIX} - Verify your email`,
        url,
      });

      await client.mails.updateLastTimestampMailSent({ userId: user.id });
    },
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: SERVER_ENV.GOOGLE_CLIENT_ID || "",
      clientSecret: SERVER_ENV.GOOGLE_CLIENT_SECRET || "",
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
    haveIBeenPwned({
      customPasswordCompromisedMessage:
        ZAP_DEFAULT_SETTINGS.AUTH.PASSWORD_COMPROMISED_MESSAGE,
    }),
  ],
});
