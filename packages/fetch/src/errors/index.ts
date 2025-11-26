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
  issues: unknown[];

  constructor(issues: unknown[]) {
    super(JSON.stringify(issues, null, 2));
    this.name = "ValidationError";
    this.issues = issues;
  }
}
