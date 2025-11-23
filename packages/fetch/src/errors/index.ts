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
