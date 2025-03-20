import { PluginMetadata } from "../../schemas/plugins.schema";

export const polarPlugin: PluginMetadata = {
  name: "polar",
  dependencies: ["@polar-sh/better-auth", "@polar-sh/sdk"],
  available: false,
  env: ["POLAR_ACCESS_TOKEN", "POLAR_WEBHOOK_SECRET"],
};
