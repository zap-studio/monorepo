import { PluginMetadata } from "../../schemas/plugins.schema";

export const pwaPlugin: PluginMetadata = {
  name: "pwa",
  dependencies: ["ky", "web-push"],
  available: {
    drizzle: true,
    prisma: false,
  },
};
