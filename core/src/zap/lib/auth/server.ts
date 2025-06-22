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
import { sendForgotPasswordMail } from "@/zap/actions/mails/send-forgot-password-mail.action";
import { sendVerificationMail } from "@/zap/actions/mails/send-verification-mail.action";
import { canSendMail } from "@/zap/lib/mails/can-send-mail";
import { updateLastTimestampMailSent } from "@/zap/lib/mails/update-last-timestamp-mail-sent";

export const auth = betterAuth({
  appName: "Zap.ts",
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: SETTINGS.AUTH.MINIMUM_PASSWORD_LENGTH,
    maxPasswordLength: SETTINGS.AUTH.MAXIMUM_PASSWORD_LENGTH,
    requireEmailVerification: SETTINGS.AUTH.REQUIRE_MAIL_VERIFICATION,
    sendResetPassword: async ({ user, url }) => {
      const { canSend, timeLeft } = await canSendMail(user.id);
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

      await updateLastTimestampMailSent(user.id);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const { canSend, timeLeft } = await canSendMail(user.id);
      if (!canSend) {
        throw new Error(
          `Please wait ${timeLeft} seconds before requesting another password reset email.`,
        );
      }

      await sendVerificationMail({
        recipients: [user.email],
        subject: `${SETTINGS.MAIL.PREFIX} - Verify your email`,
        url,
      });

      await updateLastTimestampMailSent(user.id);
    },
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
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
