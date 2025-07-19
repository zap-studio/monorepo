import { exec } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import chalk from 'chalk';
import { Effect } from 'effect';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';
import type { PackageManager } from '@/schemas/index.js';
import { PROJECT_NAME_REGEX } from '@/types/cli.js';
import { displayWelcome } from '@/utils/cli.js';
import {
  generateEnv,
  promptPackageManager,
  setupTemplate,
} from '@/utils/index.js';

const execAsync = promisify(exec);

export function createProjectEffect(): Effect.Effect<void, unknown, never> {
  return Effect.gen(function* (_) {
    displayWelcome();

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
        '🌟 If you like this project, consider giving it a star on GitHub!\n'
      )
    );
    process.stdout.write(
      chalk.white('👉 https://github.com/alexandretrotel/zap.ts\n')
    );
  });
}
