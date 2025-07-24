import { Effect } from 'effect';

const PROCEDURE_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/;

export function validateProcedureName(procedureName: string) {
  if (!procedureName || typeof procedureName !== 'string') {
    return Effect.fail(new Error('Procedure name must be a non-empty string'));
  }

  if (!PROCEDURE_NAME_REGEX.test(procedureName)) {
    return Effect.fail(
      new Error(
        'Procedure name must start with a letter and contain only alphanumeric characters'
      )
    );
  }

  return Effect.succeed(procedureName);
}

export function toKebabCase(procedureName: string) {
  return Effect.succeed(
    procedureName
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase()
  );
}

export function toPascalCase(procedureName: string) {
  return Effect.succeed(
    `${procedureName.charAt(0).toUpperCase()}${procedureName.slice(1)}`
  );
}
