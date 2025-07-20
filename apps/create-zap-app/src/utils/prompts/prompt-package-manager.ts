import chalk from 'chalk';
import { Effect } from 'effect';
import inquirer from 'inquirer';
import type { PackageManager } from '@/schemas';

/**
 * Prompts the user to select a package manager.
 * @param currentChoice - The current package manager choice
 * @returns A promise that resolves to the selected package manager
 *
 * @example
 * ```typescript
 * import { promptPackageManager } from '@/utils/prompts/prompt-package-manager';
 *
 * // Prompt user to select a package manager
 * const packageManager = await promptPackageManager('npm');
 * ```
 */
export function promptPackageManager(
  currentChoice: PackageManager
): Effect.Effect<PackageManager, Error, never> {
  const choices = ['npm', 'yarn', 'pnpm', 'bun'].filter(
    (choice) => choice !== currentChoice
  );

  return Effect.tryPromise({
    try: () =>
      inquirer.prompt([
        {
          type: 'list',
          name: 'packageManager',
          message: chalk.yellow('Please choose another package manager:'),
          choices,
        },
      ]),
    catch: (e) => {
      const errorMessage = e instanceof Error ? e.message : String(e);
      if (
        errorMessage.includes('User force closed') ||
        errorMessage.includes('User interrupted') ||
        errorMessage.includes('SIGINT') ||
        errorMessage.includes('SIGTERM')
      ) {
        process.exit(1);
      }
      return new Error(String(e));
    },
  }).pipe(Effect.map((response) => response.packageManager));
}
