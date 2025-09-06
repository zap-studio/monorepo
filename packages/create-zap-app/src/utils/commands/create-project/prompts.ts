import path from "node:path";
import { IDEs } from "@zap-ts/architecture/ide";
import { optionalPlugins } from "@zap-ts/architecture/plugins";
import type { IDE, OptionalPluginId } from "@zap-ts/architecture/types";
import chalk from "chalk";
import fs from "fs-extra";
import inquirer from "inquirer";
import { PromptError } from "@/lib/errors.js";
import type { PackageManager } from "@/schemas/package-manager.schema.js";
import { PROJECT_NAME_REGEX } from "@/types/cli.js";
import { getErrorMessage } from "@/utils/misc/error";

function validateProjectName(input: string) {
  if (!PROJECT_NAME_REGEX.test(input)) {
    return "Project name can only contain letters, numbers, hyphens, and underscores.";
  }

  const fullPath = path.join(process.cwd(), input);
  if (fs.existsSync(fullPath)) {
    return `Directory '${input}' already exists. Please choose a different name.`;
  }

  return true;
}

export async function promptProjectName(): Promise<string> {
  try {
    const response = (await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: chalk.yellow("What's the name of your project?"),
        default: "my-zap-app",
        validate: validateProjectName,
      },
    ])) as { projectName: string };

    return response.projectName;
  } catch (error) {
    throw new PromptError(`Failed to get project name: ${error}`);
  }
}

export async function promptPackageManagerSelection(
  message: string,
  pm?: PackageManager
): Promise<"npm" | "yarn" | "pnpm" | "bun"> {
  try {
    const response = await inquirer.prompt([
      {
        type: "list",
        name: "packageManager",
        message: chalk.yellow(message),
        choices: ["npm", "yarn", "pnpm", "bun"].filter(
          (choice) => choice !== pm
        ),
      },
    ]);

    return response.packageManager as PackageManager;
  } catch (error) {
    throw new PromptError(
      `Failed to get package manager selection: ${getErrorMessage(error)}`
    );
  }
}

export async function promptIDESelection(
  message: string
): Promise<IDE | "all" | null> {
  try {
    const response = await inquirer.prompt([
      {
        type: "list",
        name: "ide",
        message: chalk.yellow(message),
        choices: [
          { name: "All", value: "all" },
          ...Object.values(IDEs).map((ide) => ({
            name: ide.label,
            value: ide.id,
          })),
          { name: "None", value: null },
        ],
      },
    ]);

    return response.ide as IDE | "all" | null;
  } catch (error) {
    throw new PromptError(`Failed to get IDE selection: ${error}`);
  }
}

export async function promptPluginSelection(
  message: string
): Promise<OptionalPluginId[]> {
  try {
    const response = await inquirer.prompt([
      {
        type: "checkbox",
        name: "plugins",
        message: chalk.yellow(message),
        choices: Object.values(optionalPlugins).map((plugin) => ({
          name: plugin.label,
          value: plugin.id,
        })),
      },
    ]);

    return response.plugins as OptionalPluginId[];
  } catch (error) {
    throw new PromptError(`Failed to get plugin selection: ${error}`);
  }
}
