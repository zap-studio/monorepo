#!/usr/bin/env node
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { exec } from "child_process";
import { promisify } from "util";
import type { PackageManager } from "./schemas/index.js";
import { generateEnv } from "./utils/index.js";
import { ObjectLiteralExpression, Project } from "ts-morph";
import ky from "ky";
import { execa } from "execa";

const execAsync = promisify(exec);

async function main() {
  console.log(
    chalk.bold.cyan(
      "\n🚀 Welcome to create-zap-app! Let’s build something awesome.\n"
    )
  );

  // Prompt for project name with validation
  const projectResponse = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: chalk.yellow("What’s the name of your project?"),
      default: "my-zap-app",
      validate: (input: string) => {
        if (!input.match(/^[a-zA-Z0-9-_]+$/)) {
          return "Project name can only contain letters, numbers, hyphens, and underscores.";
        }
        if (fs.existsSync(path.join(process.cwd(), input))) {
          return `Directory '${input}' already exists. Please choose a different name.`;
        }
        return true;
      },
    },
  ]);
  const projectName = projectResponse.projectName;

  // Prompt for package manager
  const packageManagerResponse = await inquirer.prompt([
    {
      type: "list",
      name: "packageManager",
      message: chalk.yellow("Which package manager do you want to use?"),
      choices: ["npm", "yarn", "pnpm", "bun"],
    },
  ]);
  const packageManager =
    packageManagerResponse.packageManager as PackageManager;

  // Get output directory
  const outputDir = path.join(process.cwd(), projectName);
  const spinner = ora(`Creating project '${projectName}'...`).start();

  // Create output directory
  try {
    await fs.ensureDir(outputDir);
  } catch {
    spinner.fail(`Failed to create directory.`);
    process.exit(1);
  }

  // Download core template from GitHub
  spinner.text = "Downloading Zap.ts template from GitHub...";
  try {
    const tarballUrl =
      "https://api.github.com/repos/alexandretrotel/zap.ts/tarball/main";
    const buffer = await ky(tarballUrl).arrayBuffer();
    const tarballPath = path.join(outputDir, "zap.ts.tar.gz");
    await fs.writeFile(tarballPath, Buffer.from(buffer));

    // Extract core directory
    spinner.text = "Extracting template...";
    await execa("tar", [
      "-xzf",
      tarballPath,
      "-C",
      outputDir,
      "--strip-components=1",
      "--wildcards",
      "*/core/*",
    ]);
    await fs.remove(tarballPath);
    spinner.text = "Zap.ts template downloaded and extracted.";
  } catch (error) {
    spinner.fail(`Failed to download template.`);
    process.exit(1);
  }

  // Install dependencies
  spinner.clear();
  spinner.text = "Installing dependencies...";
  const installCmd =
    packageManager === "npm"
      ? "npm install --force"
      : packageManager === "yarn"
        ? "yarn"
        : packageManager === "pnpm"
          ? "pnpm install --force"
          : "bun install";
  await execAsync(installCmd, { cwd: outputDir });

  // Update dependencies
  spinner.clear();
  spinner.text = "Updating dependencies...";
  await execAsync(`${packageManager} update`, { cwd: outputDir });

  // Run prettier on the project
  spinner.clear();
  spinner.text = "Running Prettier on the project...";
  await execAsync(`${packageManager} run format`, { cwd: outputDir });

  // Generate .env file
  spinner.clear();
  spinner.text = "Generating .env file...";
  await generateEnv(outputDir);

  spinner.succeed("Project setup complete!");

  console.log(chalk.bold.green("\n🎉 Project created successfully!"));
  console.log("");
  console.log(
    chalk.yellow(
      "⚠️ After installation, please ensure you populate the .env file with the required values to get started."
    )
  );
  console.log("");
  console.log(chalk.cyan("Get started:"));
  console.log(chalk.white(`  cd ${path.basename(outputDir)}`));
  console.log(chalk.white(`  ${packageManager} dev\n`));

  console.log(
    chalk.magentaBright(
      "🌟 If you like this project, consider giving it a star on GitHub!"
    )
  );
  console.log(chalk.white("👉 https://github.com/alexandretrotel/zap.ts\n"));
}

async function createProcedure(procedureName: string) {
  const projectDir = process.cwd();
  const spinner = ora(`Creating procedure ${procedureName}...`).start();

  try {
    // Convert procedureName to kebab-case
    const kebabCaseName = procedureName
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/\s+/g, "-")
      .toLowerCase();

    // Generate procedure file
    const procedurePath = path.join(
      projectDir,
      "src/rpc/procedures",
      `${kebabCaseName}.rpc.ts`
    );
    await fs.ensureDir(path.dirname(procedurePath));

    const procedureContent = `
import { base } from "../middlewares";

export const ${procedureName} = base.handler(async () => {
  return { message: "Hello from ${procedureName}" };
});
    `.trim();

    await fs.writeFile(procedurePath, procedureContent);
    spinner.text = `Created ${kebabCaseName}.rpc.ts`;

    // Update router.ts
    const routerPath = path.join(projectDir, "src/rpc/router.ts");
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(routerPath);

    // Add import
    sourceFile.addImportDeclaration({
      moduleSpecifier: `./procedures/${kebabCaseName}.rpc`,
      namedImports: [procedureName],
    });

    // Find router object and add procedure
    const routerVar = sourceFile.getVariableDeclaration("router");
    if (!routerVar) {
      throw new Error("Could not find 'router' variable in router.ts");
    }

    // Get the initializer
    const initializer = routerVar.getInitializer();

    if (!initializer) {
      throw new Error("Could not find initializer for 'router' variable");
    }

    // Add procedure to router object
    const objectLiteral = initializer as unknown as ObjectLiteralExpression;
    objectLiteral.addShorthandPropertyAssignment({ name: procedureName });

    await sourceFile.save();
    spinner.text = `Updated router.ts`;

    // Create hook file
    const hookPath = path.join(
      projectDir,
      "src/hooks",
      `use-${kebabCaseName}.ts`
    );
    await fs.ensureDir(path.dirname(hookPath));

    const capitalizedProcedureName =
      procedureName.charAt(0).toUpperCase() + procedureName.slice(1);
    const hookContent = `
"use client";

import { useORPC } from "@/stores/orpc.store";
import useSWR from "swr";

export const use${capitalizedProcedureName} = () => {
  const orpc = useORPC();
  return useSWR(orpc.${procedureName}.key(), orpc.${procedureName}.queryOptions().queryFn);
};
    `.trim();

    await fs.writeFile(hookPath, hookContent);
    spinner.text = `Created use-${procedureName}.ts`;

    // Format files
    spinner.text = "Formatting files...";
    await execAsync("bun run format", { cwd: projectDir });

    spinner.succeed(`Successfully created ${procedureName} procedure!`);
    console.log(chalk.cyan("\nFiles created:"));
    console.log(chalk.white(`- src/rpc/procedures/${kebabCaseName}.rpc.ts`));
    console.log(chalk.white(`- src/hooks/use-${kebabCaseName}.ts`));
    console.log(chalk.white("\nRouter updated:"));
    console.log(chalk.white(`- src/rpc/router.ts`));
  } catch (error) {
    spinner.fail(
      `Failed to create procedure: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    process.exit(1);
  }
}

// CLI entry point
async function run() {
  const args = process.argv.slice(2);

  if (args[0] === "create" && args[1] === "procedure" && args[2]) {
    await createProcedure(args[2]);
  } else if (args.length === 0) {
    await main();
  } else {
    console.log(chalk.red("Invalid command"));
    console.log(chalk.cyan("Usage:"));
    console.log(chalk.white("  bunx create-zap-app # Create new project"));
    console.log(
      chalk.white(
        "  bunx create-zap-app create procedure <name> # Create new procedure"
      )
    );
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(chalk.bold.red("\n❌ An error occurred:"), error.message);
  process.exit(1);
});
