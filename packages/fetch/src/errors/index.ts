export class FetchError extends Error {
	constructor(
		message: string,
		public status: number,
		public statusText: string,
		public response: Response,
	) {
		super(message);
		this.name = "FetchError";
	}
}
