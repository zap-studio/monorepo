import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
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
import { Polar } from "@polar-sh/sdk";
import { polar } from "@polar-sh/better-auth";

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  // Use 'sandbox' if you're using the Polar Sandbox environment
  // Remember that access tokens, products, etc. are completely separated between environments.
  // Access tokens obtained in Production are for instance not usable in the Sandbox environment.
  server: "production",
});

export const auth = betterAuth({
  appName: "Zap.ts",
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: MINIMUM_PASSWORD_LENGTH,
    maxPasswordLength: MAXIMUM_PASSWORD_LENGTH,
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
      usernameValidator: (username) => {
        if (username === "admin") {
          return false;
        }

        return true;
      },
    }),
    anonymous(),
    magicLink({
      sendMagicLink: async (email, magicLink) => {
        // TODO: send magic link to the user
        console.log("send magic link to the user", { email, magicLink });
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // TODO: implement the sendVerificationOTP method to send the OTP to the user's email address
        console.log("sendVerificationOTP", { email, otp, type });
      },
    }),
    passkey(),
    admin(),
    organization(),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      enableCustomerPortal: true,
      checkout: {
        enabled: true,
        products: [
          {
            productId: "123-456-789", // TODO: ID of Product from Polar Dashboard
            slug: "zap-ts", // TODO: custom slug for easy reference in Checkout URL, e.g. /checkout/zap-ts
          },
        ],
        successUrl: "/success?checkout_id={CHECKOUT_ID}",
      },
      webhooks: {
        secret: process.env.POLAR_WEBHOOK_SECRET!,
        onPayload: async (payload) => {
          console.log("Polar Webhook Payload", payload);
          // TODO: handle the webhook payload
        },
      },
    }),
  ],
});
