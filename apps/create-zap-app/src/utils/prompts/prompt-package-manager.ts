import chalk from 'chalk';
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
export async function promptPackageManager(
  currentChoice: PackageManager
): Promise<PackageManager> {
  const choices = ['npm', 'yarn', 'pnpm', 'bun'].filter(
    (choice) => choice !== currentChoice
  );

  return await inquirer
    .prompt([
      {
        type: 'list',
        name: 'packageManager',
        message: chalk.yellow('Please choose another package manager:'),
        choices,
      },
    ])
    .then((response) => response.packageManager);
}
