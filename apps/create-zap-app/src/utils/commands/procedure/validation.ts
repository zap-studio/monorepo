const PROCEDURE_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/;

/**
 * Validates a procedure name to ensure it follows the required format.
 *
 * @param procedureName - The procedure name to validate
 * @returns The validated procedure name
 * @throws {Error} If the procedure name is empty, not a string, or doesn't match the required format
 *
 * @example
 * ```typescript
 * const validName = validateProcedureName("getUserData"); // ✅ Returns "getUserData"
 * validateProcedureName(""); // ❌ Throws Error: "Procedure name must be a non-empty string"
 * validateProcedureName("123invalid"); // ❌ Throws Error: "Procedure name must start with a letter..."
 * ```
 */
export function validateProcedureName(procedureName: string): string {
  if (!procedureName || typeof procedureName !== 'string') {
    throw new Error('Procedure name must be a non-empty string');
  }

  if (!PROCEDURE_NAME_REGEX.test(procedureName)) {
    throw new Error(
      'Procedure name must start with a letter and contain only alphanumeric characters'
    );
  }

  return procedureName;
}

/**
 * Converts a procedure name to kebab-case format.
 *
 * @param procedureName - The procedure name to convert
 * @returns The kebab-case version of the procedure name
 *
 * @example
 * ```typescript
 * toKebabCase("getUserData"); // Returns "get-user-data"
 * toKebabCase("createPost"); // Returns "create-post"
 * toKebabCase("API"); // Returns "a-p-i"
 * ```
 */
export function toKebabCase(procedureName: string): string {
  return procedureName
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Converts a procedure name to PascalCase format.
 *
 * @param procedureName - The procedure name to convert
 * @returns The PascalCase version of the procedure name
 *
 * @example
 * ```typescript
 * toPascalCase("getUserData"); // Returns "GetUserData"
 * toPascalCase("createPost"); // Returns "CreatePost"
 * toPascalCase("api"); // Returns "Api"
 * ```
 */
export function toPascalCase(procedureName: string): string {
  return procedureName.charAt(0).toUpperCase() + procedureName.slice(1);
}
