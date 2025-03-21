import { PluginMetadata } from "../../schemas/plugins.schema";

export const blogPlugin: PluginMetadata = {
  name: "blog",
  available: {
    drizzle: false,
    prisma: false,
  },
};
