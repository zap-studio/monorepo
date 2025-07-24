import chalk from 'chalk';
import { Console, Effect, pipe } from 'effect';
import type { Ora } from 'ora';
import type { PackageManager } from '@/schemas/package-manager.schema';
import { execAsyncEffect } from '@/utils';
import { generateEnv } from '@/utils/generation/generate-env';

export function runPrettierFormatting(
  packageManager: PackageManager,
  outputDir: string,
  spinner: Ora
) {
  const program = Effect.gen(function* () {
    spinner.text = 'Running Prettier on the project...';
    spinner.start();

    pipe(
      execAsyncEffect(`${packageManager} run format`, {
        cwd: outputDir,
      }),
      Effect.tap(() => {
        spinner.succeed('Prettier formatting complete.');
      })
    );
  });

  const recovered = pipe(
    program,
    Effect.catchAll(() => {
      spinner.warn('Failed to run Prettier, continuing anyway...');
      return Effect.succeed(undefined);
    })
  );

  return recovered;
}

export function generateEnvFile(outputDir: string, spinner: Ora) {
  const program = Effect.gen(function* () {
    spinner.text = 'Generating .env file...';
    spinner.start();

    yield* generateEnv({ outputDir, spinner });
  });

  return program;
}

export function displaySuccessMessage(
  projectName: string,
  packageManager: PackageManager
) {
  Console.log(chalk.green('Project setup complete!'));
  Console.log('\n\n');
  Console.log(chalk.bold.green('🎉 Project created successfully!'));
  Console.log('\n\n');
  Console.log(
    chalk.yellow(
      '⚠️ After installation, please ensure you populate the .env file with the required values to get started.'
    )
  );
  Console.log('\n\n');
  Console.log(chalk.cyan('Get started:\n'));
  Console.log(chalk.white(`  cd ${projectName}\n`));
  Console.log(chalk.white(`  ${packageManager} dev\n\n`));

  Console.log(
    chalk.magentaBright(
      '🌟 If you like this project, consider giving it a star on GitHub!\n'
    )
  );
  Console.log(chalk.white('👉 https://github.com/alexandretrotel/zap.ts\n'));
}
