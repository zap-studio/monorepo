import chalk from 'chalk';
import { Effect, pipe } from 'effect';
import ora from 'ora';
import { displayNextSteps } from '@/utils/cli/cli';
import { generateEnv } from '@/utils/generation/generate-env.js';

export function generateEnvEffect(filename = '.env.template') {
  return Effect.gen(function* () {
    const spinner = ora('Generating environment file...').start();

    const outputDir = process.cwd();

    yield* pipe(
      generateEnv({ outputDir, filename }),
      Effect.tap(() => {
        spinner.text = `Environment file ${chalk.green(filename)} generated successfully`;
      }),
      Effect.catchAll((error) => {
        spinner.fail('Failed to generate environment file');
        return Effect.fail(
          new Error(`Failed to write environment file: ${error}`)
        );
      })
    );

    displayNextSteps(filename);
  });
}
