import { Effect } from 'effect';
import ora from 'ora';
import { createFiles } from '@/utils/commands/procedure/create-files';
import { formatFiles } from '@/utils/commands/procedure/format-files';
import { printSuccessLogs } from '@/utils/commands/procedure/print-success-log';
import { validateAndConvertName } from '@/utils/commands/procedure/validate-and-convert-name';

export function createProcedureEffect(procedureName: string) {
  const projectDir = process.cwd();
  const spinner = ora(`Creating procedure ${procedureName}...`).start();

  const program = Effect.gen(function* () {
    const { validatedName, kebabCaseName } =
      yield* validateAndConvertName(procedureName);

    yield* createFiles(projectDir, validatedName, kebabCaseName, spinner);
    yield* formatFiles(projectDir, spinner);

    printSuccessLogs(validatedName, kebabCaseName);
  });

  return program;
}
