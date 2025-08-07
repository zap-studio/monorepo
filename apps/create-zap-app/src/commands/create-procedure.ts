import ora from 'ora';
import { createFiles } from '@/utils/commands/procedure/create-files';
import { formatFiles } from '@/utils/commands/procedure/format-files';
import { printSuccessLogs } from '@/utils/commands/procedure/print-success-log';
import { validateAndConvertName } from '@/utils/commands/procedure/validate-and-convert-name';

export async function createProcedure(procedureName: string) {
  const projectDir = process.cwd();
  const spinner = ora(`Creating procedure ${procedureName}...`).start();

  const { validatedName, kebabCaseName } =
    validateAndConvertName(procedureName);

  await createFiles(projectDir, validatedName, kebabCaseName, spinner);
  await formatFiles(projectDir, spinner);

  printSuccessLogs(validatedName, kebabCaseName);
}
