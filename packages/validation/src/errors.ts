import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Thrown when schema validation fails.
 *
 * @example
 * try {
 *   const result = await standardValidate(schema, data, true);
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.error("Validation failed!", error.issues);
 *   }
 * }
 */
export class ValidationError extends Error {
  issues: StandardSchemaV1.Issue[];

  constructor(issues: StandardSchemaV1.Issue[]) {
    super(JSON.stringify(issues, null, 2));
    this.name = "ValidationError";
    this.issues = issues;
  }
}
