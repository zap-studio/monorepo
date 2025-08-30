import path from 'node:path';
import chalk from 'chalk';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import { PromptError } from '@/lib/errors.js';
import type { PackageManager } from '@/schemas/package-manager.schema.js';
import { PROJECT_NAME_REGEX } from '@/types/cli.js';

function validateProjectName(input: string) {
  if (!PROJECT_NAME_REGEX.test(input)) {
    return 'Project name can only contain letters, numbers, hyphens, and underscores.';
  }

  const fullPath = path.join(process.cwd(), input);
  if (fs.existsSync(fullPath)) {
    return `Directory '${input}' already exists. Please choose a different name.`;
  }

  return true;
}

export async function promptProjectName(): Promise<string> {
  try {
    const response = (await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: chalk.yellow("What's the name of your project?"),
        default: 'my-zap-app',
        validate: validateProjectName,
      },
    ])) as { projectName: string };

    return response.projectName;
  } catch (error) {
    throw new PromptError(`Failed to get project name: ${error}`);
  }
}

export async function promptPackageManagerSelection(
  message: string,
  pm?: PackageManager
): Promise<'npm' | 'yarn' | 'pnpm' | 'bun'> {
  try {
    const response = await inquirer.prompt([
      {
        type: 'list',
        name: 'packageManager',
        message: chalk.yellow(message),
        choices: ['npm', 'yarn', 'pnpm', 'bun'].filter(
          (choice) => choice !== pm
        ),
      },
    ]);

    return response.packageManager as PackageManager;
  } catch (error) {
    throw new PromptError(`Failed to get package manager selection: ${error}`);
  }
}
