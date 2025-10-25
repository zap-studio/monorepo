export type FetchConfig<TBody> = Omit<RequestInit, "body"> & {
	body?: TBody;
	throwOnValidationError?: boolean;
};

export type ResponseType =
	| "json"
	| "text"
	| "blob"
	| "arrayBuffer"
	| "formData";
