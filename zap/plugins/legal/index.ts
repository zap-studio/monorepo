import { PluginMetadata } from "../../schemas/plugins.schema";

export const legalPlugin: PluginMetadata = {
  name: "legal",
  dependencies: ["@mdx-js/react", "@mdx-js/loader", "@next/mdx", "@types/mdx"],
  available: false,
};
