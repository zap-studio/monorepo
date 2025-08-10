import "server-only";

import { checkout, polar, portal } from "@polar-sh/better-auth";
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

import { db } from "@/db";
import { ZAP_CONFIG } from "@/zap.config";
import { SERVER_ENV } from "@/zap/env/server";
import { MailError } from "@/zap/errors";
import {
  canSendMailService,
  sendForgotPasswordMailService,
  sendVerificationMailService,
  updateLastTimestampMailSentService,
} from "@/zap/mails/services";
import { polarClient } from "@/zap/payments/providers/polar/server";

export const betterAuthServer = betterAuth({
  appName: "Zap.ts",
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: ZAP_CONFIG.AUTH.MINIMUM_PASSWORD_LENGTH,
    maxPasswordLength: ZAP_CONFIG.AUTH.MAXIMUM_PASSWORD_LENGTH,
    requireEmailVerification: ZAP_CONFIG.AUTH.REQUIRE_MAIL_VERIFICATION,
    sendResetPassword: async ({ user, url }) => {
      const { canSend, timeLeft } = await canSendMailService({
        userId: user.id,
      });

      if (!canSend) {
        throw new MailError(
          `Please wait ${timeLeft} seconds before requesting another password reset email.`,
        );
      }

      await sendForgotPasswordMailService({
        recipients: [user.email],
        subject: `${ZAP_CONFIG.MAIL.PREFIX} - Reset your password`,
        url,
      });

      await updateLastTimestampMailSentService({
        userId: user.id,
      });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,

    sendVerificationEmail: async ({ user, url }) => {
      const { canSend, timeLeft } = await canSendMailService({
        userId: user.id,
      });

      if (!canSend) {
        throw new MailError(
          `Please wait ${timeLeft} seconds before requesting another password reset email.`,
        );
      }

      const verificationUrl = new URL(url);
      verificationUrl.searchParams.set(
        "callbackURL",
        ZAP_CONFIG.AUTH.VERIFIED_EMAIL_PATH,
      );

      const modifiedUrl = verificationUrl.toString();

      await sendVerificationMailService({
        recipients: [user.email],
        subject: `${ZAP_CONFIG.MAIL.PREFIX} - Verify your email`,
        url: modifiedUrl,
      });

      await updateLastTimestampMailSentService({
        userId: user.id,
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
      createCustomerOnSignUp:
        ZAP_CONFIG.PAYMENTS.POLAR?.CREATE_CUSTOMER_ON_SIGNUP,
      use: [
        checkout({
          products: ZAP_CONFIG.PAYMENTS.POLAR?.PRODUCTS,
          successUrl: `${ZAP_CONFIG.PAYMENTS.POLAR?.SUCCESS_URL}?checkout_id={CHECKOUT_ID}`,
          authenticatedUsersOnly:
            ZAP_CONFIG.PAYMENTS.POLAR?.AUTHENTICATED_USERS_ONLY,
        }),
        portal(),
      ],
    }),
    twoFactor(),
    username({
      minUsernameLength: ZAP_CONFIG.AUTH.MINIMUM_USERNAME_LENGTH,
      maxUsernameLength: ZAP_CONFIG.AUTH.MAXIMUM_USERNAME_LENGTH,
      usernameValidator: (name) => name !== "admin",
    }),
    anonymous(),
    passkey(),
    admin(),
    organization(),
    haveIBeenPwned({
      customPasswordCompromisedMessage:
        ZAP_CONFIG.AUTH.PASSWORD_COMPROMISED_MESSAGE,
    }),
  ],
});
