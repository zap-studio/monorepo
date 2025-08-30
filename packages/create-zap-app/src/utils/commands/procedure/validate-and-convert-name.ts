import { toKebabCase, validateProcedureName } from './validation.js';

export function validateAndConvertName(procedureName: string): {
  validatedName: string;
  kebabCaseName: string;
} {
  const validatedName = validateProcedureName(procedureName);
  const kebabCaseName = toKebabCase(validatedName);

  return { validatedName, kebabCaseName };
}
