import { registerPlugin, Plugin } from "..";

export const blogPlugin: Plugin = {
  name: "blog",
  dependencies: ["@mdx-js/react", "@mdx-js/loader", "@next/mdx", "@types/mdx"],
  setup: () => {
    console.log("Blog is now enabled!");
  },
};

registerPlugin(blogPlugin);
