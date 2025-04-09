import type { PluginMetadata, PluginsMetadata } from "../schemas/index.js";

export const adminDashboardPlugin: PluginMetadata = {
  name: "admin-dashboard",
  available: false,
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

export const pwaPlugin: PluginMetadata = {
  name: "pwa",
  dependencies: ["ky", "web-push"],
  available: true,
};

export const plugins: PluginsMetadata = [
  adminDashboardPlugin,
  aiPlugin,
  blogPlugin,
  pwaPlugin,
];
