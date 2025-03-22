import type { PluginMetadata, PluginsMetadata } from "@zap-ts/schemas";

export const adminDashboardPlugin: PluginMetadata = {
  name: "admin-dashboard",
  available: {
    drizzle: false,
    prisma: false,
  },
};

export const aiPlugin: PluginMetadata = {
  name: "ai",
  dependencies: ["ai", "@ai-sdk/react", "@ai-sdk/openai", "@ai-sdk/mistral"],
  available: true,
  env: ["OPENAI_API_KEY", "MISTRAL_API_KEY"],
};

export const blogPlugin: PluginMetadata = {
  name: "blog",
  available: false,
};

export const drizzlePlugin: PluginMetadata = {
  name: "drizzle-orm",
  category: "orm",
  dependencies: ["drizzle-orm", "@neondatabase/serverless"],
  available: true,
  env: ["DATABASE_URL"],
};

export const emailsPlugin: PluginMetadata = {
  name: "emails",
  dependencies: ["resend", "react-email", "@react-email/components"],
  available: true,
  env: ["RESEND_API_KEY"],
};

export const legalPlugin: PluginMetadata = {
  name: "legal",
  available: true,
};

export const polarPlugin: PluginMetadata = {
  name: "polar",
  dependencies: ["@polar-sh/better-auth", "@polar-sh/sdk"],
  available: false,
  env: ["POLAR_ACCESS_TOKEN", "POLAR_WEBHOOK_SECRET"],
};

export const prismaPlugin: PluginMetadata = {
  name: "prisma-orm",
  category: "orm",
  dependencies: ["prisma"],
  available: false,
  env: ["DATABASE_URL"],
};

export const pwaPlugin: PluginMetadata = {
  name: "pwa",
  dependencies: ["ky", "web-push"],
  available: {
    drizzle: true,
    prisma: false,
  },
};

export const stripePlugin: PluginMetadata = {
  name: "stripe",
  dependencies: ["@better-auth/stripe", "stripe"],
  available: {
    drizzle: false,
    prisma: false,
  },
  env: ["STRIPE_WEBHOOK_SECRET", "STRIPE_SECRET_KEY"],
};

export const plugins: PluginsMetadata = [
  adminDashboardPlugin,
  aiPlugin,
  blogPlugin,
  drizzlePlugin,
  emailsPlugin,
  legalPlugin,
  polarPlugin,
  prismaPlugin,
  pwaPlugin,
  stripePlugin,
];
