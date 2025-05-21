import inquirer from "inquirer";
import chalk from "chalk";
import type { PackageManager } from "@/schemas";

export async function promptPackageManager(currentChoice: PackageManager) {
  const choices = ["npm", "yarn", "pnpm", "bun"].filter(
    (choice) => choice !== currentChoice
  );

  return inquirer
    .prompt([
      {
        type: "list",
        name: "packageManager",
        message: chalk.yellow(
          `Installation with ${currentChoice} failed. Please choose another package manager:`
        ),
        choices,
      },
    ])
    .then((response) => response.packageManager);
}
