import { registerPlugin, Plugin } from "..";

export const legalPlugin: Plugin = {
  name: "legal",
  dependencies: ["@mdx-js/react", "@mdx-js/loader", "@next/mdx", "@types/mdx"],
  setup: () => {
    console.log("Legal templates are now available!");
  },
};

registerPlugin(legalPlugin);
