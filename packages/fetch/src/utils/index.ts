import { FetchError } from "../errors";
import type { ResponseType, ResponseTypeMap } from "../types";

export function parseResponse<TResponseType extends ResponseType>(
  response: Response,
  responseType: TResponseType
): Promise<ResponseTypeMap[TResponseType]> {
  const contentType = response.headers.get("content-type");

  const parsers: Record<
    ResponseType,
    () => Promise<ResponseTypeMap[ResponseType]>
  > = {
    json: async () => {
      if (!contentType?.includes("application/json")) {
        const errorMessage = contentType
          ? `Expected JSON response but received content type: ${contentType}`
          : "Expected JSON response but received no content type";
        throw new FetchError(
          errorMessage,
          response.status,
          response.statusText,
          response
        );
      }
      return await response.json();
    },
    arrayBuffer: async () => response.arrayBuffer(),
    blob: async () => response.blob(),
    bytes: async () => {
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer);
    },
    clone: async () => response.clone(),
    formData: async () => {
      if (!contentType?.includes("multipart/form-data")) {
        throw new FetchError(
          "Expected FormData response but received different content type",
          response.status,
          response.statusText,
          response
        );
      }
      return await response.formData();
    },
    text: async () => {
      if (!contentType?.includes("text/")) {
        throw new FetchError(
          "Expected text response but received different content type",
          response.status,
          response.statusText,
          response
        );
      }
      return await response.text();
    },
  };

  const parser = parsers[responseType];
  if (!parser) {
    return Promise.reject(
      new FetchError(
        `Unsupported response type: ${responseType}`,
        response.status,
        response.statusText,
        response
      )
    ) as Promise<ResponseTypeMap[TResponseType]>;
  }

  return parser() as Promise<ResponseTypeMap[TResponseType]>;
}

export function prepareHeadersAndBody<TBody = unknown>(
  body: TBody,
  headers: HeadersInit | undefined
): { body: BodyInit | null; headers: HeadersInit | undefined } {
  let preparedBody: BodyInit | null = null;
  let preparedHeaders = headers;

  // Handle null/undefined body
  if (body === null || body === undefined) {
    return { body: null, headers: preparedHeaders };
  }

  // Check if body is already a valid BodyInit type
  if (
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof ReadableStream ||
    typeof body === "string"
  ) {
    preparedBody = body as BodyInit;
  } else if (typeof body === "object") {
    // If body is a plain object, stringify it and set Content-Type
    preparedBody = JSON.stringify(body);
    preparedHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };
  } else {
    // Handle other primitive types by converting to string
    preparedBody = String(body);
  }

  return { body: preparedBody, headers: preparedHeaders };
}
