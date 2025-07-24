import path from 'node:path';
import chalk from 'chalk';
import { Effect, pipe } from 'effect';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import type { PackageManager } from '@/schemas/package-manager.schema';
import { PROJECT_NAME_REGEX } from '@/types/cli.js';
import { handlePromptError } from '@/utils/prompts/prompt-package-manager';

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

export function promptProjectName() {
  const askProjectName = Effect.tryPromise({
    try: () =>
      inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: chalk.yellow("What's the name of your project?"),
          default: 'my-zap-app',
          validate: validateProjectName,
        },
      ]) as Promise<{ projectName: string }>,
    catch: handlePromptError,
  });

  return pipe(
    askProjectName,
    Effect.map((response) => response.projectName)
  );
}

export function promptPackageManagerSelection(
  message: string,
  pm?: PackageManager
) {
  const askPackageManager = Effect.tryPromise({
    try: () =>
      inquirer.prompt([
        {
          type: 'list',
          name: 'packageManager',
          message: chalk.yellow(message),
          choices: ['npm', 'yarn', 'pnpm', 'bun'].filter(
            (choice) => choice !== pm
          ),
        },
      ]),
    catch: handlePromptError,
  });

  return pipe(
    askPackageManager,
    Effect.map((response) => response.packageManager as PackageManager)
  );
}
