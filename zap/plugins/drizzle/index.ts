import { PluginMetadata } from "../../schemas/plugins.schema";

export const drizzlePlugin: PluginMetadata = {
  name: "drizzle",
  category: "orm",
  dependencies: ["drizzle-orm", "@neondatabase/serverless"],
  available: true,
  env: ["DATABASE_URL"],
};
