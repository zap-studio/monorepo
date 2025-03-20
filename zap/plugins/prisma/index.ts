import { registerPlugin, Plugin } from "..";

export const prismaPlugin: Plugin = {
  name: "prisma",
  category: "orm",
  dependencies: ["prisma"],
  setup: () => {
    console.log("Prisma is now enabled!");
  },
};

registerPlugin(prismaPlugin);
