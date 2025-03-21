import { PluginMetadata } from "../../schemas/plugins.schema";

export const adminDashboardPlugin: PluginMetadata = {
  name: "admin-dashboard",
  available: {
    drizzle: false,
    prisma: false,
  },
};
