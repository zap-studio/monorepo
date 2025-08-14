import chalk from 'chalk';
import ora from 'ora';
import {
  checkProcedureExists,
  createExistenceMessage,
} from '@/utils/commands/procedure/check-existence';
import { createFiles } from '@/utils/commands/procedure/create-files';
import { formatFiles } from '@/utils/commands/procedure/format-files';
import { printSuccessLogs } from '@/utils/commands/procedure/print-success-log';
import { validateAndConvertName } from '@/utils/commands/procedure/validate-and-convert-name';

export async function createProcedure(procedureName: string) {
  const projectDir = process.cwd();
  const spinner = ora(`Creating procedure ${procedureName}...`).start();

  const { validatedName, kebabCaseName } =
    validateAndConvertName(procedureName);

  spinner.text = 'Checking if procedure already exists...';
  const existenceResult = await checkProcedureExists(
    projectDir,
    validatedName,
    kebabCaseName
  );

  const existenceMessage = createExistenceMessage(
    validatedName,
    kebabCaseName,
    existenceResult
  );
  if (existenceMessage) {
    spinner.fail('Procedure already exists');
    process.stdout.write(
      chalk.yellow(`
${existenceMessage}
`)
    );
    process.stdout.write(
      chalk.cyan(`
Skipping creation to avoid conflicts.
`)
    );
    return;
  }

  spinner.text = `Creating procedure ${procedureName}...`;
  await createFiles(projectDir, validatedName, kebabCaseName, spinner);
  await formatFiles(projectDir, spinner);

  printSuccessLogs(validatedName, kebabCaseName);
}
