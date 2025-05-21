#!/usr/bin/env node
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { exec } from "child_process";
import { promisify } from "util";
import type { PackageManager } from "@/schemas/index.js";
import { generateEnv, promptPackageManager } from "@/utils/index.js";
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
  let packageManager = packageManagerResponse.packageManager as PackageManager;

  // Get output directory
  const outputDir = path.join(process.cwd(), projectName);
  const spinner = ora(`Creating project '${projectName}'...`).start();

  // Create output directory
  try {
    await fs.ensureDir(outputDir);
  } catch {
    spinner.clear();
    console.log(
      chalk.red(
        `Failed to create project directory. Please check your permissions and try again.`
      )
    );
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
    spinner.text = "Extracting Zap.ts template...";
    await execa("tar", [
      "-xzf",
      tarballPath,
      "-C",
      outputDir,
      "--strip-components=1",
    ]);
    await fs.remove(tarballPath);

    // Move the all files from `core` folder to a `temp` folder in the output directory
    const tempDir = path.join(outputDir, "temp");
    await fs.ensureDir(tempDir);

    const coreDir = path.join(outputDir, "apps/core");
    const files = await fs.readdir(coreDir);
    for (const file of files) {
      const srcPath = path.join(coreDir, file);
      const destPath = path.join(tempDir, file);
      await fs.move(srcPath, destPath, { overwrite: true });
    }

    // Remove all files from output directory except the ones from copied from `temp` folder
    const outputFiles = await fs.readdir(outputDir);
    for (const file of outputFiles) {
      const filePath = path.join(outputDir, file);
      if (file !== "temp") {
        await fs.remove(filePath);
      }
    }

    // Move the files from `temp` folder to the output directory
    const tempFiles = await fs.readdir(tempDir);
    for (const file of tempFiles) {
      const srcPath = path.join(tempDir, file);
      const destPath = path.join(outputDir, file);
      await fs.move(srcPath, destPath, { overwrite: true });
    }

    // Remove the temp directory
    await fs.remove(tempDir);

    // Clean up by removing lock files if they exist
    const lockFiles = [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
      "bun.lock",
    ];
    for (const lockFile of lockFiles) {
      const lockFilePath = path.join(outputDir, lockFile);
      if (fs.existsSync(lockFilePath)) {
        await fs.remove(lockFilePath);
      }
    }

    spinner.clear();
    console.log(chalk.green("Zap.ts template downloaded and extracted."));
  } catch (error) {
    spinner.clear();
    console.log(
      chalk.red(
        `Failed to download or extract template: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    );
    process.exit(1);
  }

  // Install dependencies with retry mechanism
  let installationSuccess = false;
  while (!installationSuccess) {
    spinner.text = `Installing dependencies with ${packageManager}...`;
    const installCmd =
      packageManager === "npm"
        ? "npm install --force"
        : packageManager === "yarn"
          ? "yarn"
          : packageManager === "pnpm"
            ? "pnpm install --force"
            : "bun install";
    try {
      await execAsync(installCmd, { cwd: outputDir });
      installationSuccess = true;
      spinner.clear();
      console.log(
        chalk.green(`Dependencies installed with ${packageManager}.`)
      );
    } catch (error) {
      spinner.clear();
      console.log(
        chalk.red(`Failed to install dependencies with ${packageManager}.`)
      );
      if (["npm", "yarn", "pnpm", "bun"].length === 1) {
        console.log(
          chalk.red(
            `All package managers failed. Please check your internet connection and try again.`
          )
        );
        process.exit(1);
      }

      packageManager = await promptPackageManager(packageManager);
    }
  }

  // Update dependencies
  spinner.text = "Updating dependencies...";
  try {
    await execAsync(`${packageManager} update`, { cwd: outputDir });
    spinner.clear();
    console.log(chalk.green("Dependencies updated."));
  } catch (error) {
    spinner.clear();
    console.log(
      chalk.yellow(`Failed to update dependencies, continuing anyway...`)
    );
  }

  // Run prettier on the project
  spinner.text = "Running Prettier on the project...";
  try {
    await execAsync(`${packageManager} run format`, { cwd: outputDir });
    spinner.clear();
    console.log(chalk.green("Prettier formatting complete."));
  } catch (error) {
    spinner.clear();
    console.log(chalk.yellow(`Failed to run Prettier, continuing anyway...`));
  }

  // Generate .env file
  spinner.text = "Generating .env file...";
  try {
    await generateEnv(outputDir);
    spinner.clear();
    console.log(chalk.green(".env file generated."));
  } catch (error) {
    spinner.clear();
    console.log(
      chalk.yellow(`Failed to generate .env file, continuing anyway...`)
    );
  }

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
  console.log(chalk.white(`  cd ${projectName}`));
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
    spinner.clear();
    console.log(chalk.green(`Created ${kebabCaseName}.rpc.ts`));

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
    console.log(chalk.green(`Updated router.ts`));

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
    console.log(chalk.green(`Created use-${kebabCaseName}.ts`));

    // Format files
    spinner.text = "Formatting files...";
    await execAsync("bun run format", { cwd: projectDir });
    spinner.clear();
    console.log(chalk.green("Files formatted."));

    spinner.succeed(`Successfully created ${procedureName} procedure!`);
    console.log(chalk.cyan("\nFiles created:"));
    console.log(chalk.white(`- src/rpc/procedures/${kebabCaseName}.rpc.ts`));
    console.log(chalk.white(`- src/hooks/use-${kebabCaseName}.ts`));
    console.log(chalk.white("\nRouter updated:"));
    console.log(chalk.white(`- src/rpc/router.ts`));
  } catch (error) {
    spinner.clear();
    console.error(
      chalk.red(
        `Failed to create procedure: ${error instanceof Error ? error.message : "Unknown error"}`
      )
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
