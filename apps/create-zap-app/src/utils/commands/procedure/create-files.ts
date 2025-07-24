import chalk from 'chalk';
import { Effect, pipe } from 'effect';
import type { Ora } from 'ora';
import { ProcessExitError } from '@/lib/effect';
import { generateHookFile, generateProcedureFile } from './file-generation';
import { updateRouterFile } from './router-update';

function createProcedureEffect(
  projectDir: string,
  validatedName: string,
  kebabCaseName: string,
  spinner: Ora
) {
  return generateProcedureFile(projectDir, validatedName, kebabCaseName).pipe(
    Effect.catchAll((error) => {
      spinner.fail(`Failed to create procedure file: ${String(error)}`);
      return Effect.fail(
        new ProcessExitError({ message: 'Creating procedure file failed' })
      );
    }),
    Effect.tap(() => {
      spinner.succeed(`Created ${kebabCaseName}.rpc.ts`);
    })
  );
}

function updateRouterEffect(
  projectDir: string,
  validatedName: string,
  kebabCaseName: string,
  spinner: Ora
) {
  return pipe(
    updateRouterFile(projectDir, validatedName, kebabCaseName),
    Effect.catchAll((error) => {
      spinner.fail(`Failed to update router: ${String(error)}`);
      return Effect.fail(
        new ProcessExitError({ message: 'Updating router failed' })
      );
    }),
    Effect.tap(() => {
      process.stdout.write(chalk.green('Updated router.ts\n'));
    })
  );
}

function createHookEffect(
  projectDir: string,
  validatedName: string,
  kebabCaseName: string,
  spinner: Ora
) {
  const recovered = pipe(
    generateHookFile(projectDir, validatedName, kebabCaseName),
    Effect.catchAll((error) => {
      spinner.fail(`Failed to create hook file: ${String(error)}`);
      return Effect.fail(
        new ProcessExitError({ message: 'Creating hook file failed' })
      );
    }),
    Effect.tap(() => {
      process.stdout.write(chalk.green(`Created use-${kebabCaseName}.ts\n`));
    })
  );

  return recovered;
}

export function createFiles(
  projectDir: string,
  validatedName: string,
  kebabCaseName: string,
  spinner: Ora
) {
  return Effect.gen(function* () {
    yield* createProcedureEffect(
      projectDir,
      validatedName,
      kebabCaseName,
      spinner
    );
    yield* updateRouterEffect(
      projectDir,
      validatedName,
      kebabCaseName,
      spinner
    );
    yield* createHookEffect(projectDir, validatedName, kebabCaseName, spinner);
  });
}
