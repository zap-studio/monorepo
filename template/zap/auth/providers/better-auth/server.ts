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

import { db } from "@/zap/db/providers/drizzle";
import { SERVER_ENV } from "@/zap/env/server";
import { MailError } from "@/zap/errors";
import {
  canSendMailService,
  sendForgotPasswordMailService,
  sendVerificationMailService,
  updateLastTimestampMailSentService,
} from "@/zap/mails/services";
import { ZAP_MAILS_CONFIG } from "@/zap/mails/zap.plugin.config";
import { polarClient } from "@/zap/payments/providers/polar/server";
import { ZAP_PAYMENTS_CONFIG } from "@/zap/payments/zap.plugin.config";
import { DEFAULT_CONFIG } from "@/zap/plugins/config/default";
import type { AuthServerPluginConfig } from "@/zap/plugins/types/auth.plugin";

export const $betterAuthServer = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
}) =>
  betterAuth({
    appName: "Zap.ts",
    database: drizzleAdapter(db, { provider: "pg" }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength:
        pluginConfigs.auth.MINIMUM_PASSWORD_LENGTH ??
        DEFAULT_CONFIG.auth.MINIMUM_PASSWORD_LENGTH,
      maxPasswordLength:
        pluginConfigs.auth.MAXIMUM_PASSWORD_LENGTH ??
        DEFAULT_CONFIG.auth.MAXIMUM_PASSWORD_LENGTH,
      requireEmailVerification:
        pluginConfigs.auth.REQUIRE_MAIL_VERIFICATION ??
        DEFAULT_CONFIG.auth.REQUIRE_MAIL_VERIFICATION,
      sendResetPassword: async ({ user, url }) => {
        const { canSend, timeLeft } = await canSendMailService({
          userId: user.id,
        });

        if (!canSend) {
          throw new MailError(
            `Please wait ${timeLeft} seconds before requesting another password reset email.`
          );
        }

        await sendForgotPasswordMailService({
          recipients: [user.email],
          subject: `${ZAP_MAILS_CONFIG.PREFIX} - Reset your password`,
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
            `Please wait ${timeLeft} seconds before requesting another password reset email.`
          );
        }

        const verificationUrl = new URL(url);
        verificationUrl.searchParams.set(
          "callbackURL",
          pluginConfigs.auth.VERIFIED_EMAIL_PATH ??
            DEFAULT_CONFIG.auth.VERIFIED_EMAIL_PATH
        );

        const modifiedUrl = verificationUrl.toString();

        await sendVerificationMailService({
          recipients: [user.email],
          subject: `${ZAP_MAILS_CONFIG.PREFIX} - Verify your email`,
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
          ZAP_PAYMENTS_CONFIG.POLAR?.CREATE_CUSTOMER_ON_SIGNUP,
        use: [
          checkout({
            products: ZAP_PAYMENTS_CONFIG.POLAR?.PRODUCTS,
            successUrl: `${ZAP_PAYMENTS_CONFIG.POLAR?.SUCCESS_URL}?checkout_id={CHECKOUT_ID}`,
            authenticatedUsersOnly:
              ZAP_PAYMENTS_CONFIG.POLAR?.AUTHENTICATED_USERS_ONLY,
          }),
          portal(),
        ],
      }),
      twoFactor(),
      username({
        minUsernameLength:
          pluginConfigs.auth.MINIMUM_USERNAME_LENGTH ??
          DEFAULT_CONFIG.auth.MINIMUM_USERNAME_LENGTH,
        maxUsernameLength:
          pluginConfigs.auth.MAXIMUM_USERNAME_LENGTH ??
          DEFAULT_CONFIG.auth.MAXIMUM_USERNAME_LENGTH,
        usernameValidator: (name) => name !== "admin",
      }),
      anonymous(),
      passkey(),
      admin(),
      organization(),
      haveIBeenPwned({
        customPasswordCompromisedMessage:
          pluginConfigs.auth.PASSWORD_COMPROMISED_MESSAGE ??
          DEFAULT_CONFIG.auth.PASSWORD_COMPROMISED_MESSAGE,
      }),
    ],
  });
