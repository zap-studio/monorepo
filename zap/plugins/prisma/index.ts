import { PluginMetadata } from "../../schemas/plugins.schema";

export const prismaPlugin: PluginMetadata = {
  name: "prisma",
  category: "orm",
  dependencies: ["prisma"],
  available: false,
  env: ["DATABASE_URL"],
};
