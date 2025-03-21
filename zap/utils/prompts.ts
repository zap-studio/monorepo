import prompts from "prompts";
import { plugins } from "../plugins-list";
import { PackageManager } from "./install-dependencies";
import { ORM, PluginNames } from "../schemas/plugins.schema";

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
      choices: (prev) => {
        const orm = prev.orm as ORM;

        return plugins
          .filter((p) => {
            if (typeof p.available === "boolean") {
              return p.available;
            }

            if (typeof p.available === "object") {
              return p.available[orm];
            }

            return false;
          })
          .filter((p) => !p.category?.includes("orm"))
          .map((p) => ({ title: p.name, value: p.name }))
          .sort((a, b) => a.title.localeCompare(b.title));
      },
    },
  ]);

  const packageManager = response.packageManager as PackageManager;
  const orm = response.orm as ORM;
  const selectedPlugins = [...response.optionalPlugins] as PluginNames;

  return { packageManager, selectedPlugins, orm };
};
