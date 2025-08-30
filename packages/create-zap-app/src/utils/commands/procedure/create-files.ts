import chalk from 'chalk';
import type { Ora } from 'ora';
import { ProcessExitError } from '@/lib/errors.js';
import { generateHookFile, generateProcedureFile } from './file-generation.js';
import { updateRouterFile } from './router-update.js';

async function createProcedure(
  projectDir: string,
  validatedName: string,
  kebabCaseName: string,
  spinner: Ora
) {
  try {
    await generateProcedureFile(projectDir, validatedName, kebabCaseName);
    spinner.succeed(`Created ${kebabCaseName}.rpc.ts`);
  } catch (error) {
    spinner.fail(`Failed to create procedure file: ${String(error)}`);
    throw new ProcessExitError('Creating procedure file failed');
  }
}

async function updateRouter(
  projectDir: string,
  validatedName: string,
  kebabCaseName: string,
  spinner: Ora
) {
  try {
    await updateRouterFile(projectDir, validatedName, kebabCaseName);
    process.stdout.write(chalk.green('Updated router.ts\n'));
  } catch (error) {
    spinner.fail(`Failed to update router: ${String(error)}`);
    throw new ProcessExitError('Updating router failed');
  }
}

async function createHook(
  projectDir: string,
  validatedName: string,
  kebabCaseName: string,
  spinner: Ora
) {
  try {
    await generateHookFile(projectDir, validatedName, kebabCaseName);
    process.stdout.write(chalk.green(`Created use-${kebabCaseName}.ts\n`));
  } catch (error) {
    spinner.fail(`Failed to create hook file: ${String(error)}`);
    throw new ProcessExitError('Creating hook file failed');
  }
}

export async function createFiles(
  projectDir: string,
  validatedName: string,
  kebabCaseName: string,
  spinner: Ora
): Promise<void> {
  await createProcedure(projectDir, validatedName, kebabCaseName, spinner);
  await updateRouter(projectDir, validatedName, kebabCaseName, spinner);
  await createHook(projectDir, validatedName, kebabCaseName, spinner);
}
