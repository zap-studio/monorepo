import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Error thrown when Standard Schema validation fails.
 *
 * The error contains the list of validation issues produced by the schema.
 * The `message` property is a JSON string representation of the issues for
 * easier debugging and logging.
 *
 * @remarks
 * This error is thrown by helpers such as `standardValidate` and
 * `standardValidateSync` when `throwOnError` is enabled.
 *
 * @example
 * ```ts
 * try {
 *   const user = await standardValidate(schema, data, true);
 *   console.log(user);
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.error("Validation failed:", error.issues);
 *   }
 * }
 * ```
 *
 * @public
 */
export class ValidationError extends Error {
  /**
   * The validation issues reported by the schema.
   */
  issues: StandardSchemaV1.Issue[];

  /**
   * Creates a new `ValidationError`.
   *
   * @param issues - The validation issues returned by the schema.
   */
  constructor(issues: StandardSchemaV1.Issue[]) {
    super(JSON.stringify(issues, null, 2));
    this.name = "ValidationError";
    this.issues = issues;
  }
}
