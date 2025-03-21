import { PluginMetadata } from "@/schemas/plugins.schema";

export const stripePlugin: PluginMetadata = {
  name: "stripe",
  dependencies: ["@better-auth/stripe", "stripe"],
  available: {
    drizzle: false,
    prisma: false,
  },
  env: ["STRIPE_WEBHOOK_SECRET", "STRIPE_SECRET_KEY"],
};
