import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { Effect } from 'effect';
import type { Ora } from 'ora';
import type { PackageManager } from '@/schemas/index.js';
import { promptPackageManager } from '@/utils/index.js';

const execAsync = promisify(exec);

/**
 * Gets the install command for a specific package manager.
 * @param pm - The package manager to get the command for
 * @returns The install command string
 *
 * @example
 * ```typescript
 * import { getInstallCommand } from './dependencies';
 *
 * getInstallCommand('npm'); // Returns 'npm install --legacy-peer-deps'
 * getInstallCommand('yarn'); // Returns 'yarn'
 * getInstallCommand('pnpm'); // Returns 'pnpm install'
 * getInstallCommand('bun'); // Returns 'bun install'
 * ```
 */
export function getInstallCommand(pm: PackageManager): string {
  switch (pm) {
    case 'npm':
      return 'npm install --legacy-peer-deps';
    case 'yarn':
      return 'yarn';
    case 'pnpm':
      return 'pnpm install';
    case 'bun':
      return 'bun install';
    default:
      return 'npm install --legacy-peer-deps';
  }
}

/**
 * Installs dependencies with retry mechanism using Effect.
 * @param pm - The package manager to use for installation
 * @param outputDir - The directory where dependencies should be installed
 * @param spinner - The ora spinner instance for user feedback
 * @returns Effect that resolves to the final package manager used
 */
export function installDependenciesWithRetry(
  pm: PackageManager,
  outputDir: string,
  spinner: Ora
): Effect.Effect<PackageManager, Error, never> {
  spinner.text = `Installing dependencies with ${pm}...`;
  spinner.start();

  const installCmd = getInstallCommand(pm);

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
        Effect.catchAll(() =>
          installDependenciesWithRetry(pm, outputDir, spinner)
        ),
        Effect.flatMap((newPackageManager) =>
          installDependenciesWithRetry(
            newPackageManager as PackageManager,
            outputDir,
            spinner
          )
        )
      )
    )
  );
}

/**
 * Updates project dependencies.
 * @param packageManager - The package manager to use
 * @param outputDir - The project directory
 * @param spinner - The ora spinner instance for user feedback
 * @returns Effect that resolves when dependencies are updated
 *
 * @example
 * ```typescript
 * import { Effect } from 'effect';
 * import { updateDependencies } from './dependencies';
 * import ora from 'ora';
 *
 * const spinner = ora().start();
 * const effect = updateDependencies('npm', '/path/to/project', spinner);
 *
 * // Run the effect
 * Effect.runPromise(effect).then(() => {
 *   console.log('Dependencies updated successfully');
 * }).catch(console.error);
 * ```
 */
export function updateDependencies(
  packageManager: PackageManager,
  outputDir: string,
  spinner: Ora
): Effect.Effect<void, Error, never> {
  spinner.text = 'Updating dependencies...';
  spinner.start();
  return Effect.tryPromise({
    try: () => execAsync(`${packageManager} update`, { cwd: outputDir }),
    catch: () =>
      spinner.warn('Failed to update dependencies, continuing anyway...'),
  }).pipe(
    Effect.tap(() => spinner.succeed('Dependencies updated.')),
    Effect.catchAll(() => Effect.succeed(undefined))
  );
}
