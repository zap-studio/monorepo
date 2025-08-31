import { ValidationError } from '@/lib/errors.js';

const PROCEDURE_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/;

export function validateProcedureName(procedureName: string): string {
  if (!procedureName || typeof procedureName !== 'string') {
    throw new ValidationError('Procedure name must be a non-empty string');
  }

  if (!PROCEDURE_NAME_REGEX.test(procedureName)) {
    throw new ValidationError(
      'Procedure name must start with a letter and contain only alphanumeric characters'
    );
  }

  return procedureName;
}

export function toKebabCase(procedureName: string): string {
  return procedureName
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

export function toPascalCase(procedureName: string) {
  return `${procedureName.charAt(0).toUpperCase()}${procedureName.slice(1)}`;
}
