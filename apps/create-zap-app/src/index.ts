#!/usr/bin/env node
import { exec } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import chalk from 'chalk';
import { Effect } from 'effect';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';
import { type ObjectLiteralExpression, Project } from 'ts-morph';
import type { PackageManager } from '@/schemas/index.js';
import {
  generateEnv,
  promptPackageManager,
  setupTemplate,
} from '@/utils/index.js';

const execAsync = promisify(exec);

const PROJECT_NAME_REGEX = /^[a-zA-Z0-9-_]+$/;

function mainEffect(): Effect.Effect<void, unknown, never> {
  return Effect.gen(function* (_) {
    process.stdout.write(
      chalk.bold.cyan(
        "\n🚀 Welcome to create-zap-app! Let's build something awesome.\n"
      )
    );

    // Prompt for project name with validation
    const projectResponse = yield* _(
      Effect.tryPromise({
        try: () =>
          inquirer.prompt([
            {
              type: 'input',
              name: 'projectName',
              message: chalk.yellow("What's the name of your project?"),
              default: 'my-zap-app',
              validate: (input: string) => {
                if (!PROJECT_NAME_REGEX.test(input)) {
                  return 'Project name can only contain letters, numbers, hyphens, and underscores.';
                }
                if (fs.existsSync(path.join(process.cwd(), input))) {
                  return `Directory '${input}' already exists. Please choose a different name.`;
                }
                return true;
              },
            },
          ]),
        catch: (e) => new Error(`Prompt failed: ${String(e)}`),
      })
    );
    const projectName = projectResponse.projectName;

    // Prompt for package manager
    const packageManagerResponse = yield* _(
      Effect.tryPromise({
        try: () =>
          inquirer.prompt([
            {
              type: 'list',
              name: 'packageManager',
              message: chalk.yellow(
                'Which package manager do you want to use?'
              ),
              choices: ['npm', 'yarn', 'pnpm', 'bun'],
            },
          ]),
        catch: (e) => new Error(`Prompt failed: ${String(e)}`),
      })
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
            'Failed to create project directory. Please check your permissions and try again.'
          );
          process.exit(1);
        },
      })
    );

    // Download core template from GitHub
    spinner.text = 'Downloading Zap.ts template from GitHub...';
    yield* _(
      Effect.tryPromise({
        try: () => setupTemplate(outputDir, spinner),
        catch: () => {
          spinner.fail(
            'Failed to download or extract template. Please check your internet connection and try again.'
          );
          process.exit(1);
        },
      })
    );

    // Install dependencies with retry mechanism using Effect
    function installWithRetry(
      pm: PackageManager
    ): Effect.Effect<PackageManager, never, never> {
      spinner.text = `Installing dependencies with ${pm}...`;
      spinner.start();

      let installCmd: string;
      if (pm === 'npm') {
        installCmd = 'npm install --legacy-peer-deps';
      } else if (pm === 'yarn') {
        installCmd = 'yarn';
      } else if (pm === 'pnpm') {
        installCmd = 'pnpm install';
      } else {
        installCmd = 'bun install';
      }

      return Effect.tryPromise({
        try: () => execAsync(installCmd, { cwd: outputDir }),
        catch: (e) => (e instanceof Error ? e : new Error(String(e))),
      }).pipe(
        Effect.map(() => {
          spinner.succeed(`Dependencies installed with ${pm}.`);
          return pm;
        }),
        Effect.catchAll(() =>
          Effect.tryPromise({
            try: () => {
              spinner.fail(`Failed to install dependencies with ${pm}.`);
              return promptPackageManager(pm);
            },
            catch: (e) => (e instanceof Error ? e : new Error(String(e))),
          }).pipe(
            Effect.catchAll(() => installWithRetry(pm)),
            Effect.flatMap((newPackageManager) =>
              installWithRetry(newPackageManager as PackageManager)
            )
          )
        )
      );
    }

    const finalPackageManager = yield* _(installWithRetry(packageManager));
    packageManager = finalPackageManager;

    // Update dependencies
    spinner.text = 'Updating dependencies...';
    spinner.start();
    yield* _(
      Effect.tryPromise({
        try: () => execAsync(`${packageManager} update`, { cwd: outputDir }),
        catch: () =>
          spinner.warn('Failed to update dependencies, continuing anyway...'),
      })
    );
    spinner.succeed('Dependencies updated.');

    // Run prettier on the project
    spinner.text = 'Running Prettier on the project...';
    spinner.start();
    yield* _(
      Effect.tryPromise({
        try: () =>
          execAsync(`${packageManager} run format`, { cwd: outputDir }),
        catch: () =>
          spinner.warn('Failed to run Prettier, continuing anyway...'),
      })
    );
    spinner.succeed('Prettier formatting complete.');

    // Generate .env file
    spinner.text = 'Generating .env file...';
    spinner.start();
    yield* _(
      Effect.try({
        try: () => generateEnv(outputDir),
        catch: () =>
          spinner.warn('Failed to generate .env file, continuing anyway...'),
      })
    );
    spinner.succeed('.env file generated.');

    process.stdout.write(chalk.green('Project setup complete!'));

    process.stdout.write('\n\n');
    process.stdout.write(chalk.bold.green('🎉 Project created successfully!'));
    process.stdout.write('\n\n');
    process.stdout.write(
      chalk.yellow(
        '⚠️ After installation, please ensure you populate the .env file with the required values to get started.'
      )
    );
    process.stdout.write('\n\n');
    process.stdout.write(chalk.cyan('Get started:\n'));
    process.stdout.write(chalk.white(`  cd ${projectName}\n`));
    process.stdout.write(chalk.white(`  ${packageManager} dev\n\n`));

    process.stdout.write(
      chalk.magentaBright(
        '🌟 If you like this project, consider giving it a star on GitHub!'
      )
    );
    process.stdout.write(
      chalk.white('👉 https://github.com/alexandretrotel/zap.ts\n')
    );
  });
}

function createProcedureEffect(
  procedureName: string
): Effect.Effect<void, unknown, never> {
  return Effect.gen(function* (_) {
    const projectDir = process.cwd();
    const spinner = ora(`Creating procedure ${procedureName}...`).start();

    // Convert procedureName to kebab-case
    const kebabCaseName = procedureName
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase();

    // Generate procedure file
    const procedurePath = path.join(
      projectDir,
      'src/rpc/procedures',
      `${kebabCaseName}.rpc.ts`
    );
    yield* _(
      Effect.tryPromise({
        try: () => fs.ensureDir(path.dirname(procedurePath)),
        catch: (e) => {
          spinner.fail(`Failed to ensure procedure directory: ${String(e)}`);
          process.exit(1);
        },
      })
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
      })
    );
    spinner.succeed(`Created ${kebabCaseName}.rpc.ts`);

    // Update router.ts
    const routerPath = path.join(projectDir, 'src/rpc/router.ts');
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(routerPath);

    // Add import
    sourceFile.addImportDeclaration({
      moduleSpecifier: `./procedures/${kebabCaseName}.rpc`,
      namedImports: [procedureName],
    });

    // Find router object and add procedure
    const routerVar = sourceFile.getVariableDeclaration('router');
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
      })
    );
    process.stdout.write(chalk.green('Updated router.ts'));

    // Create hook file
    const hookPath = path.join(
      projectDir,
      'src/hooks',
      `use-${kebabCaseName}.ts`
    );
    yield* _(
      Effect.tryPromise({
        try: () => fs.ensureDir(path.dirname(hookPath)),
        catch: (e) => {
          spinner.fail(`Failed to ensure hook directory: ${String(e)}`);
          process.exit(1);
        },
      })
    );

    const capitalizedProcedureName =
      procedureName.charAt(0).toUpperCase() + procedureName.slice(1);
    const hookContent = `
"use client";

import { useORPC } from "@/zap/stores/orpc.store";
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
      })
    );
    process.stdout.write(chalk.green(`Created use-${kebabCaseName}.ts`));

    // Format files
    spinner.text = 'Formatting files...';
    spinner.start();
    yield* _(
      Effect.tryPromise({
        try: () => execAsync('npm run format', { cwd: projectDir }),
        catch: (e) => {
          spinner.fail(`Failed to format files: ${String(e)}`);
          process.exit(1);
        },
      })
    );
    spinner.succeed('Files formatted.');

    process.stdout.write(
      chalk.green(`Successfully created ${procedureName} procedure!`)
    );
    process.stdout.write(chalk.cyan('\nFiles created:'));
    process.stdout.write(
      chalk.white(`- src/rpc/procedures/${kebabCaseName}.rpc.ts`)
    );
    process.stdout.write(chalk.white(`- src/hooks/use-${kebabCaseName}.ts`));
    process.stdout.write(chalk.white('\nRouter updated:'));
    process.stdout.write(chalk.white('- src/rpc/router.ts'));
  });
}

// CLI entry point
async function run() {
  const args = process.argv.slice(2);

  if (args[0] === 'create' && args[1] === 'procedure' && args[2]) {
    await Effect.runPromise(createProcedureEffect(args[2]));
  } else if (args.length === 0) {
    await Effect.runPromise(mainEffect()).catch((error) => {
      process.stderr.write(
        chalk.bold.red('\n❌ An error occurred:'),
        error?.message ?? error
      );
      process.exit(1);
    });
  } else {
    process.stdout.write(chalk.red('Invalid command'));
    process.stdout.write(chalk.cyan('Usage:'));
    process.stdout.write(
      chalk.white('  pnpm dlx create-zap-app # Create new project')
    );
    process.stdout.write(
      chalk.white(
        '  pnpm dlx create-zap-app create procedure <name> # Create new procedure'
      )
    );
    process.exit(1);
  }
}

run();
