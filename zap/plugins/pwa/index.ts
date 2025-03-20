import { registerPlugin, Plugin } from "..";

export const pwaPlugin: Plugin = {
  name: "pwa",
  dependencies: ["ky"],
  setup: () => {
    console.log("PWA is now enabled!");
  },
};

registerPlugin(pwaPlugin);
