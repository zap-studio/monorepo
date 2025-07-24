import { Effect, pipe } from 'effect';
import type { Ora } from 'ora';
import type { PackageManager } from '@/schemas/package-manager.schema';
import { execAsyncEffect } from '@/utils';
import { handlePromptError } from '@/utils/prompts/prompt-package-manager';
import { promptPackageManagerSelection } from './prompts';

export function getInstallCommand(pm: PackageManager) {
  switch (pm) {
    case 'npm':
      return Effect.succeed('npm install --legacy-peer-deps');
    case 'yarn':
      return Effect.succeed('yarn');
    case 'pnpm':
      return Effect.succeed('pnpm install');
    case 'bun':
      return Effect.succeed('bun install');
    default:
      return Effect.succeed('npm install --legacy-peer-deps');
  }
}

export function installDependenciesWithRetry(
  initialPM: PackageManager,
  outputDir: string,
  spinner: Ora
) {
  const maxRetries = 3;

  const program = Effect.gen(function* () {
    let retryCount = 0;
    let currentPM: PackageManager = initialPM;

    while (retryCount <= maxRetries) {
      spinner.text = `Installing dependencies with ${currentPM}...`;
      spinner.start();

      const installCmd = yield* getInstallCommand(currentPM);

      const success = yield* pipe(
        execAsyncEffect(installCmd, { cwd: outputDir }),
        Effect.map(() => {
          spinner.succeed(`Dependencies installed with ${currentPM}.`);
          return true;
        }),
        Effect.catchAll(() => Effect.succeed(false))
      );

      if (success) {
        return currentPM;
      }

      retryCount++;
      spinner.fail(`Failed to install dependencies with ${currentPM}.`);

      if (retryCount > maxRetries) {
        return yield* Effect.fail(
          new Error(
            `Failed to install dependencies after ${maxRetries} attempts. Please try installing manually.`
          )
        );
      }

      const newPM = yield* pipe(
        promptPackageManagerSelection(currentPM),
        Effect.catchAll(handlePromptError)
      );

      currentPM = newPM as PackageManager;
    }

    return currentPM;
  });

  return program;
}

export function updateDependencies(
  packageManager: PackageManager,
  outputDir: string,
  spinner: Ora
) {
  const program = Effect.gen(function* () {
    spinner.text = 'Updating dependencies...';
    spinner.start();

    yield* execAsyncEffect(`${packageManager} update`, { cwd: outputDir });
    spinner.succeed('Dependencies updated successfully.');
  });

  return pipe(
    program,
    Effect.catchAll(() => {
      spinner.warn('Failed to update dependencies, continuing anyway...');
      return Effect.succeed(undefined);
    })
  );
}
