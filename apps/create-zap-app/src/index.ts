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
import { execa } from "execa";
import { Effect } from "effect";

const execAsync = promisify(exec);

function mainEffect(): Effect.Effect<void, unknown, never> {
  return Effect.gen(function* (_) {
    console.log(
      chalk.bold.cyan(
        "\n🚀 Welcome to create-zap-app! Let's build something awesome.\n",
      ),
    );

    // Prompt for project name with validation
    const projectResponse = yield* _(
      Effect.tryPromise({
        try: () =>
          inquirer.prompt([
            {
              type: "input",
              name: "projectName",
              message: chalk.yellow("What's the name of your project?"),
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
          ]),
        catch: (e) => new Error(`Prompt failed: ${String(e)}`),
      }),
    );
    const projectName = projectResponse.projectName;

    // Prompt for package manager
    const packageManagerResponse = yield* _(
      Effect.tryPromise({
        try: () =>
          inquirer.prompt([
            {
              type: "list",
              name: "packageManager",
              message: chalk.yellow(
                "Which package manager do you want to use?",
              ),
              choices: ["npm", "yarn", "pnpm"],
            },
          ]),
        catch: (e) => new Error(`Prompt failed: ${String(e)}`),
      }),
    );
    let packageManager =
      packageManagerResponse.packageManager as PackageManager;

    // Get output directory
    const outputDir = path.join(process.cwd(), projectName);
    const spinner = ora(`Creating project '${projectName}'...`).start();

    // Create output directory
    yield* _(
      Effect.tryPromise({
        try: () => fs.ensureDir(outputDir),
        catch: () => {
          spinner.fail(
            `Failed to create project directory. Please check your permissions and try again.`,
          );
          process.exit(1);
        },
      }),
    );

    // Download core template from GitHub
    spinner.text = "Downloading Zap.ts template from GitHub...";
    yield* _(
      Effect.tryPromise({
        try: async () => {
          const tarballUrl =
            "https://api.github.com/repos/alexandretrotel/zap.ts/tarball/main";
          const response = await fetch(tarballUrl);
          const buffer = await response.arrayBuffer();
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

          const coreDir = path.join(outputDir, "core");
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
          ];
          for (const lockFile of lockFiles) {
            const lockFilePath = path.join(outputDir, lockFile);
            if (fs.existsSync(lockFilePath)) {
              await fs.remove(lockFilePath);
            }
          }

          spinner.succeed("Zap.ts template downloaded and extracted.");
        },
        catch: () => {
          spinner.fail(
            `Failed to download or extract template. Please check your internet connection and try again.`,
          );
          process.exit(1);
        },
      }),
    );

    // Install dependencies with retry mechanism using Effect
    function installWithRetry(
      packageManager: PackageManager,
    ): Effect.Effect<PackageManager, never, never> {
      spinner.text = `Installing dependencies with ${packageManager}...`;
      spinner.start();
      const installCmd =
        packageManager === "npm"
          ? "npm install --legacy-peer-deps"
          : packageManager === "yarn"
            ? "yarn"
            : "pnpm install";

      return Effect.tryPromise({
        try: () => execAsync(installCmd, { cwd: outputDir }),
        catch: (e) => (e instanceof Error ? e : new Error(String(e))),
      }).pipe(
        Effect.map(() => {
          spinner.succeed(`Dependencies installed with ${packageManager}.`);
          return packageManager;
        }),
        Effect.catchAll(() =>
          Effect.tryPromise({
            try: () => {
              spinner.fail(
                `Failed to install dependencies with ${packageManager}.`,
              );
              return promptPackageManager(packageManager);
            },
            catch: (e) => (e instanceof Error ? e : new Error(String(e))),
          }).pipe(
            Effect.catchAll(() => installWithRetry(packageManager)),
            Effect.flatMap((newPackageManager) =>
              installWithRetry(newPackageManager as PackageManager),
            ),
          ),
        ),
      );
    }

    const finalPackageManager = yield* _(installWithRetry(packageManager));
    packageManager = finalPackageManager;

    // Update dependencies
    spinner.text = "Updating dependencies...";
    spinner.start();
    yield* _(
      Effect.tryPromise({
        try: () => execAsync(`${packageManager} update`, { cwd: outputDir }),
        catch: () =>
          spinner.warn(`Failed to update dependencies, continuing anyway...`),
      }),
    );
    spinner.succeed("Dependencies updated.");

    // Run prettier on the project
    spinner.text = "Running Prettier on the project...";
    spinner.start();
    yield* _(
      Effect.tryPromise({
        try: () =>
          execAsync(`${packageManager} run format`, { cwd: outputDir }),
        catch: () =>
          spinner.warn(`Failed to run Prettier, continuing anyway...`),
      }),
    );
    spinner.succeed("Prettier formatting complete.");

    // Generate .env file
    spinner.text = "Generating .env file...";
    spinner.start();
    yield* _(
      Effect.tryPromise({
        try: () => generateEnv(outputDir),
        catch: () =>
          spinner.warn(`Failed to generate .env file, continuing anyway...`),
      }),
    );
    spinner.succeed(".env file generated.");

    console.log(chalk.green("Project setup complete!"));

    console.log(chalk.bold.green("\n🎉 Project created successfully!"));
    console.log("");
    console.log(
      chalk.yellow(
        "⚠️ After installation, please ensure you populate the .env file with the required values to get started.",
      ),
    );
    console.log("");
    console.log(chalk.cyan("Get started:"));
    console.log(chalk.white(`  cd ${projectName}`));
    console.log(chalk.white(`  ${packageManager} dev\n`));

    console.log(
      chalk.magentaBright(
        "🌟 If you like this project, consider giving it a star on GitHub!",
      ),
    );
    console.log(chalk.white("👉 https://github.com/alexandretrotel/zap.ts\n"));
  });
}

function createProcedureEffect(
  procedureName: string,
): Effect.Effect<void, unknown, never> {
  return Effect.gen(function* (_) {
    const projectDir = process.cwd();
    const spinner = ora(`Creating procedure ${procedureName}...`).start();

    // Convert procedureName to kebab-case
    const kebabCaseName = procedureName
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/\s+/g, "-")
      .toLowerCase();

    // Generate procedure file
    const procedurePath = path.join(
      projectDir,
      "src/rpc/procedures",
      `${kebabCaseName}.rpc.ts`,
    );
    yield* _(
      Effect.tryPromise({
        try: () => fs.ensureDir(path.dirname(procedurePath)),
        catch: (e) => {
          spinner.fail(`Failed to ensure procedure directory: ${String(e)}`);
          process.exit(1);
        },
      }),
    );

    const procedureContent = `
import { base } from "../middlewares";

export const ${procedureName} = base.handler(async () => {
  return { message: "Hello from ${procedureName}" };
});
    `.trim();

    yield* _(
      Effect.tryPromise({
        try: () => fs.writeFile(procedurePath, procedureContent),
        catch: (e) => {
          spinner.fail(`Failed to write procedure file: ${String(e)}`);
          process.exit(1);
        },
      }),
    );
    spinner.succeed(`Created ${kebabCaseName}.rpc.ts`);

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
      spinner.fail("Could not find 'router' variable in router.ts");
      process.exit(1);
    }

    // Get the initializer
    const initializer = routerVar.getInitializer();

    if (!initializer) {
      spinner.fail("Could not find initializer for 'router' variable");
      process.exit(1);
    }

    // Add procedure to router object
    const objectLiteral = initializer as unknown as ObjectLiteralExpression;
    objectLiteral.addShorthandPropertyAssignment({ name: procedureName });

    yield* _(
      Effect.tryPromise({
        try: () => sourceFile.save(),
        catch: (e) => {
          spinner.fail(`Failed to save router.ts: ${String(e)}`);
          process.exit(1);
        },
      }),
    );
    console.log(chalk.green(`Updated router.ts`));

    // Create hook file
    const hookPath = path.join(
      projectDir,
      "src/hooks",
      `use-${kebabCaseName}.ts`,
    );
    yield* _(
      Effect.tryPromise({
        try: () => fs.ensureDir(path.dirname(hookPath)),
        catch: (e) => {
          spinner.fail(`Failed to ensure hook directory: ${String(e)}`);
          process.exit(1);
        },
      }),
    );

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

    yield* _(
      Effect.tryPromise({
        try: () => fs.writeFile(hookPath, hookContent),
        catch: (e) => {
          spinner.fail(`Failed to write hook file: ${String(e)}`);
          process.exit(1);
        },
      }),
    );
    console.log(chalk.green(`Created use-${kebabCaseName}.ts`));

    // Format files
    spinner.text = "Formatting files...";
    spinner.start();
    yield* _(
      Effect.tryPromise({
        try: () => execAsync("npm run format", { cwd: projectDir }),
        catch: (e) => {
          spinner.fail(`Failed to format files: ${String(e)}`);
          process.exit(1);
        },
      }),
    );
    spinner.succeed("Files formatted.");

    console.log(
      chalk.green(`Successfully created ${procedureName} procedure!`),
    );
    console.log(chalk.cyan("\nFiles created:"));
    console.log(chalk.white(`- src/rpc/procedures/${kebabCaseName}.rpc.ts`));
    console.log(chalk.white(`- src/hooks/use-${kebabCaseName}.ts`));
    console.log(chalk.white("\nRouter updated:"));
    console.log(chalk.white(`- src/rpc/router.ts`));
  });
}

// CLI entry point
async function run() {
  const args = process.argv.slice(2);

  if (args[0] === "create" && args[1] === "procedure" && args[2]) {
    await createProcedureEffect(args[2]);
  } else if (args.length === 0) {
    await Effect.runPromise(mainEffect()).catch((error) => {
      console.error(
        chalk.bold.red("\n❌ An error occurred:"),
        error?.message ?? error,
      );
      process.exit(1);
    });
  } else {
    console.log(chalk.red("Invalid command"));
    console.log(chalk.cyan("Usage:"));
    console.log(chalk.white("  pnpm dlx create-zap-app # Create new project"));
    console.log(
      chalk.white(
        "  pnpm dlx create-zap-app create procedure <name> # Create new procedure",
      ),
    );
    process.exit(1);
  }
}

run();
