import type { StandardSchemaV1 } from "@standard-schema/spec";

export class FetchError extends Error {
  status: Response["status"];
  response: Response;

  constructor(message: string, response: Response) {
    super(message);
    this.name = "FetchError";
    this.status = response.status;
    this.response = response;
  }
}

export class ValidationError extends Error {
  issues: StandardSchemaV1.Issue[];

  constructor(issues: StandardSchemaV1.Issue[]) {
    super(JSON.stringify(issues, null, 2));
    this.name = "ValidationError";
    this.issues = issues;
  }
}
