import type { PackageManager } from "@/schemas";
import chalk from "chalk";
import inquirer from "inquirer";

export async function promptPackageManager(currentChoice: PackageManager) {
	const choices = ["npm", "yarn", "pnpm"].filter(
		(choice) => choice !== currentChoice,
	);

	return inquirer
		.prompt([
			{
				type: "list",
				name: "packageManager",
				message: chalk.yellow("Please choose another package manager:"),
				choices,
			},
		])
		.then((response) => response.packageManager);
}
