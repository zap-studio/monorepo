/**
 * Error thrown for HTTP errors (non-2xx responses)
 */
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
