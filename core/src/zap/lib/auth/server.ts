import "server-only";

import { checkout, polar, portal, usage } from "@polar-sh/better-auth";
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
import { polarClient } from "@/zap/lib/polar/server";
import { canSendMailService } from "@/zap/services/mails/can-send-mail.service";
import { sendForgotPasswordMailService } from "@/zap/services/mails/send-forgot-password-mail.service";
import { sendVerificationMailService } from "@/zap/services/mails/send-verification-mail.service";
import { updateLastTimestampMailSentService } from "@/zap/services/mails/update-last-timestamp-mail-sent.service";

export const auth = betterAuth({
  appName: "Zap.ts",
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: SETTINGS.AUTH.MINIMUM_PASSWORD_LENGTH,
    maxPasswordLength: SETTINGS.AUTH.MAXIMUM_PASSWORD_LENGTH,
    requireEmailVerification: SETTINGS.AUTH.REQUIRE_MAIL_VERIFICATION,
    sendResetPassword: async ({ user, url }) => {
      const { canSend, timeLeft } = await canSendMailService({
        input: { userId: user.id },
      });

      if (!canSend) {
        throw new Error(
          `Please wait ${timeLeft} seconds before requesting another password reset email.`,
        );
      }

      await sendForgotPasswordMailService({
        input: {
          recipients: [user.email],
          subject: `${SETTINGS.MAIL.PREFIX} - Reset your password`,
          url,
        },
      });

      await updateLastTimestampMailSentService({
        input: { userId: user.id },
      });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,

    sendVerificationEmail: async ({ user, url }) => {
      const { canSend, timeLeft } = await canSendMailService({
        input: { userId: user.id },
      });

      if (!canSend) {
        throw new Error(
          `Please wait ${timeLeft} seconds before requesting another password reset email.`,
        );
      }

      const verificationUrl = new URL(url);
      verificationUrl.searchParams.set(
        "callbackURL",
        ZAP_DEFAULT_SETTINGS.AUTH.VERIFIED_EMAIL_PATH,
      );

      const modifiedUrl = verificationUrl.toString();

      await sendVerificationMailService({
        input: {
          recipients: [user.email],
          subject: `${SETTINGS.MAIL.PREFIX} - Verify your email`,
          url: modifiedUrl,
        },
      });

      await updateLastTimestampMailSentService({
        input: { userId: user.id },
      });
    },
  },
  socialProviders: {
    github: {
      clientId: SERVER_ENV.GITHUB_CLIENT_ID || "",
      clientSecret: SERVER_ENV.GITHUB_CLIENT_SECRET || "",
    },
    google: {
      enabled: true,
      clientId: SERVER_ENV.GOOGLE_CLIENT_ID || "",
      clientSecret: SERVER_ENV.GOOGLE_CLIENT_SECRET || "",
    },
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "123-456-789", // ID of Product from Polar Dashboard
              slug: "pro", // Custom slug for easy reference in Checkout URL, e.g. /checkout/pro
            },
          ],
          successUrl: "/success?checkout_id={CHECKOUT_ID}",
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
      ],
    }),
    twoFactor(),
    username({
      minUsernameLength: SETTINGS.AUTH.MINIMUM_USERNAME_LENGTH,
      maxUsernameLength: SETTINGS.AUTH.MAXIMUM_USERNAME_LENGTH,
      usernameValidator: (name) => name !== "admin",
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
