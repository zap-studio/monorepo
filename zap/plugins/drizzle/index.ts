import { registerPlugin, Plugin } from "..";

export const drizzlePlugin: Plugin = {
  name: "drizzle",
  category: "orm",
  dependencies: ["drizzle-orm", "@neondatabase/serverless"],
  setup: () => {
    console.log("Drizzle is now enabled!");
  },
};

registerPlugin(drizzlePlugin);
