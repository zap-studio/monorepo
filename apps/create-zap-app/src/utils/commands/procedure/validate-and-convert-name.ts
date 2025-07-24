import { Effect } from 'effect';
import { toKebabCase, validateProcedureName } from './validation';

export function validateAndConvertName(procedureName: string) {
  const program = Effect.gen(function* () {
    const validatedName = yield* validateProcedureName(procedureName);
    const kebabCaseName = yield* toKebabCase(validatedName);

    return { validatedName, kebabCaseName };
  });

  return program;
}
