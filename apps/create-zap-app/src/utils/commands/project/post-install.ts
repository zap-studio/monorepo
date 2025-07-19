import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import chalk from 'chalk';
import { Effect } from 'effect';
import type { Ora } from 'ora';
import type { PackageManager } from '@/schemas/index.js';
import { generateEnv } from '@/utils/index.js';

const execAsync = promisify(exec);

/**
 * Runs Prettier formatting on the project.
 * @param packageManager - The package manager to use
 * @param outputDir - The project directory
 * @param spinner - The ora spinner instance for user feedback
 * @returns Effect that resolves when formatting is complete
 */
export function runPrettierFormatting(
  packageManager: PackageManager,
  outputDir: string,
  spinner: Ora
): Effect.Effect<void, Error, never> {
  spinner.text = 'Running Prettier on the project...';
  spinner.start();
  return Effect.tryPromise({
    try: () => execAsync(`${packageManager} run format`, { cwd: outputDir }),
    catch: () => spinner.warn('Failed to run Prettier, continuing anyway...'),
  }).pipe(
    Effect.tap(() => {
      spinner.succeed('Prettier formatting complete.');
    }),
    Effect.catchAll(() => Effect.succeed(undefined))
  );
}

/**
 * Generates the .env file for the project.
 * @param outputDir - The project directory
 * @param spinner - The ora spinner instance for user feedback
 * @returns Effect that resolves when .env file is generated
 */
export function generateEnvFile(
  outputDir: string,
  spinner: Ora
): Effect.Effect<void, Error, never> {
  spinner.text = 'Generating .env file...';
  spinner.start();
  return Effect.try({
    try: () => generateEnv(outputDir),
    catch: () =>
      spinner.warn('Failed to generate .env file, continuing anyway...'),
  }).pipe(
    Effect.tap(() => {
      spinner.succeed('.env file generated.');
    }),
    Effect.catchAll(() => Effect.succeed(undefined))
  );
}

/**
 * Displays the final success message and instructions.
 * @param projectName - The name of the created project
 * @param packageManager - The package manager used
 */
export function displaySuccessMessage(
  projectName: string,
  packageManager: PackageManager
): void {
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
}
