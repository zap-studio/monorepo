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
import { FLAGS } from "@/data/flags";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { sendForgotPasswordMail } from "@/actions/emails.action";

export const auth = betterAuth({
  appName: "Zap.ts",
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: MINIMUM_PASSWORD_LENGTH,
    maxPasswordLength: MAXIMUM_PASSWORD_LENGTH,
    requireEmailVerification: FLAGS.IS_EMAIL_VERIFICATION_REQUIRED,
    sendResetPassword: async ({ user, url }) => {
      await sendForgotPasswordMail({
        recipients: [user.email],
        subject: "Reset your password",
        url,
      });
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
      minUsernameLength: MINIMUM_USERNAME_LENGTH,
      maxUsernameLength: MAXIMUM_USERNAME_LENGTH,
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
