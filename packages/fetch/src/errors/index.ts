export class FetchError extends Error {
  status: number;
  statusText: string;
  response: Response;

  constructor(
    message: string,
    status: number,
    statusText: string,
    response: Response
  ) {
    super(message);
    this.name = "FetchError";
    this.status = status;
    this.statusText = statusText;
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
