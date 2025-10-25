export type FetchConfig<TBody> = Omit<RequestInit, "body"> & {
	body?: TBody;
	throwOnValidationError?: boolean;
};

export type ResponseType =
	| "arrayBuffer"
	| "blob"
	| "bytes"
	| "clone"
	| "formData"
	| "json"
	| "text";

export type ResponseTypeMap = {
	arrayBuffer: ArrayBuffer;
	blob: Blob;
	bytes: Uint8Array;
	clone: Response;
	formData: FormData;
	json: unknown;
	text: string;
};
