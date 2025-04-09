import type { PluginMetadata, PluginsMetadata } from "../schemas/index.js";

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

export const plugins: PluginsMetadata = [
  adminDashboardPlugin,
  aiPlugin,
  blogPlugin,
  drizzlePlugin,
  prismaPlugin,
  pwaPlugin,
];
