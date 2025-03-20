import prompts from "prompts";
import { plugins } from "../plugins-list";

export const getPromptAnswers = async () => {
  const response = await prompts([
    {
      type: "select",
      name: "packageManager",
      message: "Please choose a package manager:",
      choices: [
        { title: "bun", value: "bun" },
        { title: "npm", value: "npm" },
        { title: "yarn", value: "yarn" },
        { title: "pnpm", value: "pnpm" },
      ],
    },
    {
      type: "select",
      name: "orm",
      message: "Choose an ORM (required):",
      choices: [
        { title: "Drizzle", value: "drizzle" },
        { title: "Prisma (not supported yet)", value: "prisma" },
      ],
    },
    {
      type: "multiselect",
      name: "optionalPlugins",
      message: "Select optional plugins:",
      choices: plugins
        .filter((p) => (!p.category || p.category !== "orm") && p.available)
        .map((p) => ({ title: p.name, value: p.name }))
        .sort((a, b) => a.title.localeCompare(b.title)),
    },
  ]);

  const packageManager = response.packageManager as
    | "bun"
    | "npm"
    | "yarn"
    | "pnpm";
  const selectedPlugins = [
    response.orm as "drizzle" | "prisma",
    ...(response.optionalPlugins as string[]),
  ];

  return { packageManager, selectedPlugins };
};
