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
        throw new FetchError(errorMessage, response);
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
          response
        );
      }
      return await response.formData();
    },
    text: async () => {
      if (!contentType?.includes("text/")) {
        throw new FetchError(
          "Expected text response but received different content type",
          response
        );
      }
      return await response.text();
    },
  };

  const parser = parsers[responseType];
  if (!parser) {
    return Promise.reject(
      new FetchError(`Unsupported response type: ${responseType}`, response)
    ) as Promise<ResponseTypeMap[TResponseType]>;
  }

  return parser() as Promise<ResponseTypeMap[TResponseType]>;
}
