import chalk from 'chalk';
import inquirer from 'inquirer';
import type { PackageManager } from '@/schemas';

export async function promptPackageManager(currentChoice: PackageManager) {
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
