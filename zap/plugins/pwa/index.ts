import { PluginMetadata } from "../../schemas/plugins.schema";

export const pwaPlugin: PluginMetadata = {
  name: "pwa",
  dependencies: ["ky"],
  available: true,
};
