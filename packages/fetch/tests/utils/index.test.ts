import { describe, expect, it } from "vitest";
import { FetchError } from "../../src/errors";
import { parseResponse, prepareHeadersAndBody } from "../../src/utils";

describe("prepareHeadersAndBody", () => {
  describe("null and undefined handling", () => {
    it("should return null body for undefined", () => {
      const result = prepareHeadersAndBody(undefined, undefined);
      expect(result.body).toBeNull();
      expect(result.headers).toBeUndefined();
    });

    it("should return null body for null", () => {
      const result = prepareHeadersAndBody(null, undefined);
      expect(result.body).toBeNull();
      expect(result.headers).toBeUndefined();
    });

    it("should preserve headers when body is null", () => {
      const headers = { Authorization: "Bearer token" };
      const result = prepareHeadersAndBody(null, headers);
      expect(result.body).toBeNull();
      expect(result.headers).toEqual(headers);
    });
  });

  describe("BodyInit types", () => {
    it("should pass FormData through unchanged", () => {
      const formData = new FormData();
      formData.append("key", "value");
      const result = prepareHeadersAndBody(formData, undefined);
      expect(result.body).toBe(formData);
      expect(result.headers).toBeUndefined();
    });

    it("should pass URLSearchParams through unchanged", () => {
      const params = new URLSearchParams({ key: "value" });
      const result = prepareHeadersAndBody(params, undefined);
      expect(result.body).toBe(params);
      expect(result.headers).toBeUndefined();
    });

    it("should pass Blob through unchanged", () => {
      const blob = new Blob(["test"], { type: "text/plain" });
      const result = prepareHeadersAndBody(blob, undefined);
      expect(result.body).toBe(blob);
      expect(result.headers).toBeUndefined();
    });

    it("should pass ArrayBuffer through unchanged", () => {
      const buffer = new ArrayBuffer(8);
      const result = prepareHeadersAndBody(buffer, undefined);
      expect(result.body).toBe(buffer);
      expect(result.headers).toBeUndefined();
    });

    it("should pass ReadableStream through unchanged", () => {
      const stream = new ReadableStream();
      const result = prepareHeadersAndBody(stream, undefined);
      expect(result.body).toBe(stream);
      expect(result.headers).toBeUndefined();
    });

    it("should pass string through unchanged", () => {
      const text = "plain text";
      const result = prepareHeadersAndBody(text, undefined);
      expect(result.body).toBe(text);
      expect(result.headers).toBeUndefined();
    });
  });

  describe("object serialization", () => {
    it("should stringify plain objects and set Content-Type", () => {
      const obj = { name: "test", value: 123 };
      const result = prepareHeadersAndBody(obj, undefined);
      expect(result.body).toBe(JSON.stringify(obj));
      expect(result.headers).toEqual({
        "Content-Type": "application/json",
      });
    });

    it("should merge Content-Type with existing headers for objects", () => {
      const obj = { data: "test" };
      const existingHeaders = { Authorization: "Bearer token" };
      const result = prepareHeadersAndBody(obj, existingHeaders);
      expect(result.body).toBe(JSON.stringify(obj));
      expect(result.headers).toEqual({
        "Content-Type": "application/json",
        Authorization: "Bearer token",
      });
    });

    it("should preserve custom Content-Type when provided", () => {
      const obj = { data: "test" };
      const headers = { "Content-Type": "application/xml" };
      const result = prepareHeadersAndBody(obj, headers);
      expect(result.body).toBe(JSON.stringify(obj));
      expect(result.headers).toEqual({
        "Content-Type": "application/xml",
      });
    });
  });

  describe("primitive types", () => {
    it("should convert number to string", () => {
      const result = prepareHeadersAndBody(123, undefined);
      expect(result.body).toBe("123");
      expect(result.headers).toBeUndefined();
    });

    it("should convert boolean to string", () => {
      const result = prepareHeadersAndBody(true, undefined);
      expect(result.body).toBe("true");
      expect(result.headers).toBeUndefined();
    });
  });
});

describe("parseResponse", () => {
  describe("json response type", () => {
    it("should parse JSON response with correct content-type", async () => {
      const mockData = { id: 1, name: "test" };
      const response = Response.json(mockData);

      const result = await parseResponse(response, "json");
      expect(result).toEqual(mockData);
    });

    it("should parse JSON with charset in content-type", async () => {
      const mockData = { value: "test" };
      const response = Response.json(mockData);

      const result = await parseResponse(response, "json");
      expect(result).toEqual(mockData);
    });

    it("should throw FetchError when JSON expected but content-type missing", async () => {
      const response = Response.json({ data: "test" });

      await expect(parseResponse(response, "json")).rejects.toThrow(FetchError);
      await expect(parseResponse(response, "json")).rejects.toThrow(
        "Expected JSON response but received no content type"
      );
    });

    it("should throw FetchError when JSON expected but content-type is wrong", async () => {
      const response = new Response("<html></html>", {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "text/html" },
      });

      await expect(parseResponse(response, "json")).rejects.toThrow(FetchError);
      await expect(parseResponse(response, "json")).rejects.toThrow(
        "Expected JSON response but received no content type"
      );
    });
  });

  describe("text response type", () => {
    it("should parse text response with text/plain content-type", async () => {
      const mockText = "plain text content";
      const response = new Response(mockText, {
        headers: { "content-type": "text/plain" },
      });

      const result = await parseResponse(response, "text");
      expect(result).toBe(mockText);
    });

    it("should parse text response with text/html content-type", async () => {
      const mockHtml = "<html><body>test</body></html>";
      const response = new Response(mockHtml, {
        headers: { "content-type": "text/html" },
      });

      const result = await parseResponse(response, "text");
      expect(result).toBe(mockHtml);
    });

    it("should throw FetchError when text expected but content-type is wrong", async () => {
      const response = new Response("test", {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
      });

      await expect(parseResponse(response, "text")).rejects.toThrow(FetchError);
      await expect(parseResponse(response, "text")).rejects.toThrow(
        "Expected text response but received different content type"
      );
    });
  });

  describe("blob response type", () => {
    it("should parse blob response", async () => {
      const mockData = new Blob(["test data"], { type: "text/plain" });
      const response = new Response(mockData);

      const result = await parseResponse(response, "blob");
      expect(result).toBeDefined();
      expect(result.constructor.name).toBe("Blob");
      expect(result.type).toContain("text/plain");
    });

    it("should handle binary blob data", async () => {
      const buffer = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
      const blob = new Blob([buffer]);
      const response = new Response(blob);

      const result = await parseResponse(response, "blob");
      expect(result).toBeDefined();
      expect(result.constructor.name).toBe("Blob");
    });
  });

  describe("arrayBuffer response type", () => {
    it("should parse arrayBuffer response", async () => {
      const buffer = new Uint8Array([1, 2, 3, 4]).buffer;
      const response = new Response(buffer);

      const result = await parseResponse(response, "arrayBuffer");
      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBe(4);
    });

    it("should handle empty arrayBuffer", async () => {
      const response = new Response(new ArrayBuffer(0));

      const result = await parseResponse(response, "arrayBuffer");
      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBe(0);
    });
  });

  describe("bytes response type", () => {
    it("should parse bytes as Uint8Array", async () => {
      const buffer = new Uint8Array([1, 2, 3, 4]);
      const response = new Response(buffer);

      const result = await parseResponse(response, "bytes");
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(4);
      expect(Array.from(result)).toEqual([1, 2, 3, 4]);
    });

    it("should convert ArrayBuffer to Uint8Array", async () => {
      const buffer = new ArrayBuffer(8);
      const view = new Uint8Array(buffer);
      view.set([10, 20, 30, 40, 50, 60, 70, 80]);
      const response = new Response(buffer);

      const result = await parseResponse(response, "bytes");
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(8);
      expect(Array.from(result)).toEqual([10, 20, 30, 40, 50, 60, 70, 80]);
    });
  });

  describe("formData response type", () => {
    it("should parse formData response with correct content-type", async () => {
      const formData = new FormData();
      formData.append("key", "value");
      formData.append("number", "123");

      // Create a proper multipart/form-data body
      const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
      const body = `------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="key"\r\n\r\nvalue\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="number"\r\n\r\n123\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--`;

      const response = new Response(body, {
        headers: {
          "content-type": `multipart/form-data; boundary=${boundary}`,
        },
      });

      const result = await parseResponse(response, "formData");
      expect(result).toBeDefined();
      expect(result.constructor.name).toBe("FormData");
      expect(result.get("key")).toBe("value");
      expect(result.get("number")).toBe("123");
    });

    it("should throw FetchError when formData expected but content-type is wrong", async () => {
      const response = new Response("test", {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
      });

      await expect(parseResponse(response, "formData")).rejects.toThrow(
        FetchError
      );
      await expect(parseResponse(response, "formData")).rejects.toThrow(
        "Expected FormData response but received different content type"
      );
    });
  });

  describe("clone response type", () => {
    it("should clone the response", async () => {
      const mockData = { id: 1, name: "test" };
      const response = Response.json(mockData);

      const result = await parseResponse(response, "clone");
      expect(result).toBeInstanceOf(Response);
      expect(result).not.toBe(response);

      const data = await result.json();
      expect(data).toEqual(mockData);
    });

    it("should allow reading cloned response multiple times", async () => {
      const mockData = "test data";
      const response = new Response(mockData, {
        headers: { "content-type": "text/plain" },
      });

      const cloned = await parseResponse(response, "clone");
      const text1 = await cloned.text();

      // Original response should still be readable after clone
      const text2 = await response.text();

      expect(text1).toBe(mockData);
      expect(text2).toBe(mockData);
    });
  });

  describe("unsupported response type", () => {
    it("should throw FetchError for unsupported response type", async () => {
      const response = new Response("test", {
        status: 200,
        statusText: "OK",
      });

      // @ts-expect-error - testing invalid response type
      await expect(parseResponse(response, "invalid")).rejects.toThrow(
        FetchError
      );
      // @ts-expect-error - testing invalid response type
      await expect(parseResponse(response, "invalid")).rejects.toThrow(
        "Unsupported response type: invalid"
      );
    });
  });
});
