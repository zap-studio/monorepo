import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Error thrown for validation errors
 */
export class ValidationError extends Error {
  issues: StandardSchemaV1.Issue[];

  constructor(issues: StandardSchemaV1.Issue[]) {
    super(JSON.stringify(issues, null, 2));
    this.name = "ValidationError";
    this.issues = issues;
  }
}
