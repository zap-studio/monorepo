import { PluginMetadata } from "../../schemas/plugins.schema";

export const blogPlugin: PluginMetadata = {
  name: "blog",
  dependencies: ["@mdx-js/react", "@mdx-js/loader", "@next/mdx", "@types/mdx"],
  available: false,
};
