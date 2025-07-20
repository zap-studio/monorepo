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
 * import { getInstallCommand } from '@/utils/commands/project/dependencies.js';
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
 * @param retryCount - The current retry count (internal use)
 * @returns Effect that resolves to the final package manager used
 *
 * @example
 * ```typescript
 * import { installDependenciesWithRetry } from '@/utils/commands/project/dependencies.js';
 *
 * installDependenciesWithRetry('npm', '/path/to/project', spinner);
 * ```
 */
export function installDependenciesWithRetry(
  pm: PackageManager,
  outputDir: string,
  spinner: Ora,
  retryCount = 0
): Effect.Effect<PackageManager, Error, never> {
  const maxRetries = 3;

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
    Effect.catchAll(() => {
      if (retryCount >= maxRetries) {
        return Effect.fail(
          new Error(
            `Failed to install dependencies after ${maxRetries} attempts. Please try installing manually.`
          )
        );
      }

      return Effect.sync(() => {
        spinner.fail(`Failed to install dependencies with ${pm}.`);
      })
        .pipe(Effect.flatMap(() => promptPackageManager(pm)))
        .pipe(
          Effect.catchAll((error) => {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            if (
              errorMessage.includes('User force closed') ||
              errorMessage.includes('User interrupted') ||
              errorMessage.includes('SIGINT') ||
              errorMessage.includes('SIGTERM')
            ) {
              process.exit(1);
            }
            return installDependenciesWithRetry(
              pm,
              outputDir,
              spinner,
              retryCount + 1
            );
          }),
          Effect.flatMap((newPackageManager) =>
            installDependenciesWithRetry(
              newPackageManager as PackageManager,
              outputDir,
              spinner,
              0
            )
          )
        );
    })
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
 * import { updateDependencies } from '@/utils/commands/project/dependencies.js';
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
