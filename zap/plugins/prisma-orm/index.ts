import { PluginMetadata } from "../../schemas/plugins.schema";

export const prismaPlugin: PluginMetadata = {
  name: "prisma-orm",
  category: "orm",
  dependencies: ["prisma"],
  available: false,
  env: ["DATABASE_URL"],
};
