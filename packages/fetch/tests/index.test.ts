import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { api, safeFetch } from "../src";
import { FetchError } from "../src/errors";

describe("safeFetch", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    global.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("successful requests", () => {
    it("should fetch and validate JSON data", async () => {
      const schema = z.object({
        id: z.number(),
        name: z.string(),
      });

      const mockData = { id: 1, name: "Test User" };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockData,
      });

      const result = await safeFetch("https://api.example.com/user", schema);

      expect(result).toEqual(mockData);
      expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/user", {
        body: null,
        headers: undefined,
      });
    });

    it("should handle GET requests", async () => {
      const schema = z.object({ success: z.boolean() });
      const mockData = { success: true };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockData,
      });

      const result = await safeFetch("https://api.example.com/data", schema, {
        method: "GET",
      });

      expect(result).toEqual(mockData);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/data",
        expect.objectContaining({
          method: "GET",
        })
      );
    });

    it("should handle POST requests with JSON body", async () => {
      const schema = z.object({ id: z.number() });
      const mockData = { id: 123 };
      const requestBody = { name: "New Item" };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 201,
        statusText: "Created",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockData,
      });

      const result = await safeFetch("https://api.example.com/items", schema, {
        method: "POST",
        body: requestBody,
      });

      expect(result).toEqual(mockData);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/items",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
    });

    it("should handle FormData body", async () => {
      const schema = z.object({ uploaded: z.boolean() });
      const mockData = { uploaded: true };
      const formData = new FormData();
      formData.append("file", new Blob(["test"]), "test.txt");

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockData,
      });

      const result = await safeFetch("https://api.example.com/upload", schema, {
        method: "POST",
        body: formData,
      });

      expect(result).toEqual(mockData);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/upload",
        expect.objectContaining({
          method: "POST",
          body: formData,
          headers: undefined,
        })
      );
    });
    it("should handle string body", async () => {
      const schema = z.object({ received: z.string() });
      const mockData = { received: "text data" };
      const textBody = "plain text content";

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockData,
      });

      const result = await safeFetch("https://api.example.com/text", schema, {
        method: "POST",
        body: textBody,
      });

      expect(result).toEqual(mockData);
      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/text",
        expect.objectContaining({
          method: "POST",
          body: textBody,
          headers: undefined,
        })
      );
    });
    it("should respect custom Content-Type header", async () => {
      const schema = z.object({ success: z.boolean() });
      const mockData = { success: true };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockData,
      });

      await safeFetch("https://api.example.com/custom", schema, {
        method: "POST",
        body: { data: "test" },
        headers: {
          "Content-Type": "application/xml",
        },
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/custom",
        expect.objectContaining({
          headers: {
            "Content-Type": "application/xml",
          },
        })
      );
    });
  });

  describe("response types", () => {
    describe("json", () => {
      it("should handle JSON responses with correct content-type", async () => {
        const schema = z.object({ id: z.number(), name: z.string() });
        const mockData = { id: 1, name: "Test" };

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockData,
        });

        const result = await safeFetch("https://api.example.com/data", schema, {
          responseType: "json",
        });

        expect(result).toEqual(mockData);
      });

      it("should default to JSON response type when not specified", async () => {
        const schema = z.object({ id: z.number() });
        const mockData = { id: 1 };

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockData,
        });

        const result = await safeFetch("https://api.example.com/data", schema);

        expect(result).toEqual(mockData);
      });

      it("should throw FetchError when expecting JSON but content-type is missing", async () => {
        const schema = z.object({ id: z.number() });

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers(),
          json: async () => ({ id: 1 }),
        });

        await expect(
          safeFetch("https://api.example.com/data", schema, {
            responseType: "json",
          })
        ).rejects.toThrow(FetchError);
      });

      it("should throw FetchError when expecting JSON but content-type is wrong", async () => {
        const schema = z.object({ id: z.number() });

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers({ "content-type": "text/html" }),
          json: async () => ({ id: 1 }),
        });

        await expect(
          safeFetch("https://api.example.com/data", schema, {
            responseType: "json",
          })
        ).rejects.toThrow(FetchError);
      });
    });

    describe("text", () => {
      it("should handle text responses with correct content-type", async () => {
        const schema = z.string();
        const mockText = "Plain text response";

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers({ "content-type": "text/plain" }),
          text: async () => mockText,
        });

        const result = await safeFetch("https://api.example.com/text", schema, {
          responseType: "text",
        });

        expect(result).toBe(mockText);
      });

      it("should handle text/html content-type", async () => {
        const schema = z.string();
        const mockHtml = "<html><body>Hello</body></html>";

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers({ "content-type": "text/html" }),
          text: async () => mockHtml,
        });

        const result = await safeFetch("https://api.example.com/page", schema, {
          responseType: "text",
        });

        expect(result).toBe(mockHtml);
      });

      it("should throw FetchError when expecting text but content-type is wrong", async () => {
        const schema = z.string();

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers({ "content-type": "application/json" }),
          text: async () => "text",
        });

        await expect(
          safeFetch("https://api.example.com/text", schema, {
            responseType: "text",
          })
        ).rejects.toThrow(FetchError);
      });
    });

    describe("blob", () => {
      it("should handle blob responses", async () => {
        const schema = z.instanceof(Blob);
        const mockBlob = new Blob(["test content"], { type: "text/plain" });

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers(),
          blob: async () => mockBlob,
        });

        const result = await safeFetch("https://api.example.com/file", schema, {
          responseType: "blob",
        });

        expect(result).toBe(mockBlob);
        expect(result).toBeInstanceOf(Blob);
      });

      it("should handle binary blob responses", async () => {
        const schema = z.instanceof(Blob);
        const mockBlob = new Blob([new Uint8Array([1, 2, 3, 4])], {
          type: "application/octet-stream",
        });

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers(),
          blob: async () => mockBlob,
        });

        const result = await safeFetch(
          "https://api.example.com/binary",
          schema,
          {
            responseType: "blob",
          }
        );

        expect(result).toBe(mockBlob);
      });
    });

    describe("arrayBuffer", () => {
      it("should handle arrayBuffer responses", async () => {
        const schema = z.instanceof(ArrayBuffer);
        const mockBuffer = new ArrayBuffer(8);

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers(),
          arrayBuffer: async () => mockBuffer,
        });

        const result = await safeFetch(
          "https://api.example.com/binary",
          schema,
          {
            responseType: "arrayBuffer",
          }
        );

        expect(result).toBe(mockBuffer);
        expect(result).toBeInstanceOf(ArrayBuffer);
      });

      it("should handle arrayBuffer with data", async () => {
        const schema = z.instanceof(ArrayBuffer);
        const view = new Uint8Array([1, 2, 3, 4, 5]);
        const mockBuffer = view.buffer;

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers(),
          arrayBuffer: async () => mockBuffer,
        });

        const result = await safeFetch("https://api.example.com/data", schema, {
          responseType: "arrayBuffer",
        });

        expect(result).toBe(mockBuffer);
        expect(new Uint8Array(result as ArrayBuffer)).toEqual(view);
      });
    });

    describe("bytes", () => {
      it("should handle bytes (Uint8Array) responses", async () => {
        const schema = z.instanceof(Uint8Array);
        const mockBuffer = new Uint8Array([1, 2, 3, 4]).buffer;

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers(),
          arrayBuffer: async () => mockBuffer,
        });

        const result = await safeFetch(
          "https://api.example.com/bytes",
          schema,
          {
            responseType: "bytes",
          }
        );

        expect(result).toBeInstanceOf(Uint8Array);
        expect(result).toEqual(new Uint8Array([1, 2, 3, 4]));
      });

      it("should convert ArrayBuffer to Uint8Array", async () => {
        const schema = z.instanceof(Uint8Array);
        const data = [10, 20, 30, 40, 50];
        const mockBuffer = new Uint8Array(data).buffer;

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers(),
          arrayBuffer: async () => mockBuffer,
        });

        const result = await safeFetch(
          "https://api.example.com/bytes",
          schema,
          {
            responseType: "bytes",
          }
        );

        expect(Array.from(result as Uint8Array)).toEqual(data);
      });
    });

    describe("formData", () => {
      it("should handle formData responses with correct content-type", async () => {
        const schema = z.instanceof(FormData);
        const mockFormData = new FormData();
        mockFormData.append("key", "value");
        mockFormData.append("name", "test");

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers({ "content-type": "multipart/form-data" }),
          formData: async () => mockFormData,
        });

        const result = await safeFetch("https://api.example.com/form", schema, {
          responseType: "formData",
        });

        expect(result).toBe(mockFormData);
        expect(result).toBeInstanceOf(FormData);
      });

      it("should throw FetchError when expecting formData but content-type is wrong", async () => {
        const schema = z.instanceof(FormData);
        const mockFormData = new FormData();

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers({ "content-type": "application/json" }),
          formData: async () => mockFormData,
        });

        await expect(
          safeFetch("https://api.example.com/form", schema, {
            responseType: "formData",
          })
        ).rejects.toThrow(FetchError);
      });
    });

    describe("clone", () => {
      it("should handle clone response type", async () => {
        const mockResponse = new Response(JSON.stringify({ id: 1 }), {
          status: 200,
          statusText: "OK",
          headers: new Headers({ "content-type": "application/json" }),
        });

        const mockClone = mockResponse.clone();

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers(),
          clone: () => mockClone,
        });

        const schema = z.instanceof(Response);
        const result = await safeFetch("https://api.example.com/data", schema, {
          responseType: "clone",
        });

        expect(result).toBe(mockClone);
        expect(result).toBeInstanceOf(Response);
      });

      it("should allow reading cloned response multiple times", async () => {
        const mockData = { id: 1, name: "Test" };
        const mockResponse = new Response(JSON.stringify(mockData), {
          status: 200,
          statusText: "OK",
          headers: new Headers({ "content-type": "application/json" }),
        });

        const mockClone = mockResponse.clone();

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers(),
          clone: () => mockClone,
        });

        const schema = z.instanceof(Response);
        const result = await safeFetch("https://api.example.com/data", schema, {
          responseType: "clone",
        });

        // Should be able to read the response
        const data = await (result as Response).json();
        expect(data).toEqual(mockData);
      });
    });

    describe("unsupported response type", () => {
      it("should throw FetchError for unsupported response type", async () => {
        const schema = z.unknown();

        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers(),
        });

        await expect(
          safeFetch("https://api.example.com/data", schema, {
            // @ts-expect-error - Testing invalid response type
            responseType: "invalid",
          })
        ).rejects.toThrow(FetchError);
      });
    });
  });

  describe("validation", () => {
    it("should throw on validation error when throwOnValidationError is true", async () => {
      const schema = z.object({
        id: z.number(),
        email: z.email(),
      });

      const invalidData = { id: 1, email: "not-an-email" };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => invalidData,
      });

      await expect(
        safeFetch("https://api.example.com/user", schema, {
          throwOnValidationError: true,
        })
      ).rejects.toThrow();
    });

    it("should return safe parse result when throwOnValidationError is false", async () => {
      const schema = z.object({
        id: z.number(),
        email: z.email(),
      });

      const invalidData = { id: 1, email: "not-an-email" };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => invalidData,
      });

      const result = await safeFetch("https://api.example.com/user", schema, {
        throwOnValidationError: false,
      });

      expect(result).toHaveProperty("success");
      if ("success" in result && result.success) {
        // This block should not be executed for invalid data
      }
    });

    it("should return successful parse result when data is valid and throwOnValidationError is false", async () => {
      const schema = z.object({
        id: z.number(),
        email: z.email(),
      });

      const validData = { id: 1, email: "test@example.com" };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => validData,
      });

      const result = await safeFetch("https://api.example.com/user", schema, {
        throwOnValidationError: false,
      });

      expect(result).toHaveProperty("success");
      if ("success" in result && result.success) {
        expect(result.data).toEqual(validData);
      }
    });
  });

  describe("error handling", () => {
    it("should throw FetchError on HTTP error status", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      const schema = z.object({ id: z.number() });

      await expect(
        safeFetch("https://api.example.com/notfound", schema)
      ).rejects.toThrow(FetchError);

      try {
        await safeFetch("https://api.example.com/notfound", schema);
      } catch (error) {
        expect(error).toBeInstanceOf(FetchError);
        if (error instanceof FetchError) {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe("Not Found");
          expect(error.message).toContain("404");
        }
      }
    });

    it("should throw FetchError on 500 server error", async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const schema = z.object({ id: z.number() });

      await expect(
        safeFetch("https://api.example.com/error", schema)
      ).rejects.toThrow(FetchError);
    });

    it("should throw FetchError when expecting JSON but receiving different content type", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "text/html" }),
      });

      const schema = z.object({ id: z.number() });

      await expect(
        safeFetch("https://api.example.com/html", schema, {
          responseType: "json",
        })
      ).rejects.toThrow(FetchError);
    });
  });

  describe("headers", () => {
    it("should pass custom headers to fetch", async () => {
      const schema = z.object({ success: z.boolean() });
      const mockData = { success: true };

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockData,
      });

      await safeFetch("https://api.example.com/auth", schema, {
        headers: {
          Authorization: "Bearer token123",
          "X-Custom-Header": "custom-value",
        },
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example.com/auth",
        expect.objectContaining({
          headers: {
            Authorization: "Bearer token123",
            "X-Custom-Header": "custom-value",
          },
        })
      );
    });
  });
});

describe("api convenience methods", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    global.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should make GET request with api.get", async () => {
    const schema = z.object({ id: z.number() });
    const mockData = { id: 1 };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockData,
    });

    const result = await api.get("https://api.example.com/item", schema);

    expect(result).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/item",
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  it("should make POST request with api.post", async () => {
    const schema = z.object({ id: z.number() });
    const mockData = { id: 123 };
    const body = { name: "Test" };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      statusText: "Created",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockData,
    });

    const result = await api.post(
      "https://api.example.com/items",
      schema,
      body
    );

    expect(result).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/items",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });

  it("should make PUT request with api.put", async () => {
    const schema = z.object({ id: z.number() });
    const mockData = { id: 123 };
    const body = { name: "Updated" };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockData,
    });

    const result = await api.put(
      "https://api.example.com/items/123",
      schema,
      body
    );

    expect(result).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/items/123",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(body),
      })
    );
  });

  it("should make PATCH request with api.patch", async () => {
    const schema = z.object({ id: z.number() });
    const mockData = { id: 123 };
    const body = { name: "Patched" };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockData,
    });

    const result = await api.patch(
      "https://api.example.com/items/123",
      schema,
      body
    );

    expect(result).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/items/123",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify(body),
      })
    );
  });

  it("should make DELETE request with api.delete", async () => {
    const schema = z.object({ success: z.boolean() });
    const mockData = { success: true };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockData,
    });

    const result = await api.delete(
      "https://api.example.com/items/123",
      schema
    );

    expect(result).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/items/123",
      expect.objectContaining({
        method: "DELETE",
      })
    );
  });

  it("should pass additional config to api methods", async () => {
    const schema = z.object({ id: z.number() });
    const mockData = { id: 1 };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockData,
    });

    await api.get("https://api.example.com/item", schema, {
      headers: {
        Authorization: "Bearer token",
      },
      signal: new AbortController().signal,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/item",
      expect.objectContaining({
        method: "GET",
        headers: {
          Authorization: "Bearer token",
        },
        signal: expect.any(AbortSignal),
      })
    );
  });
});

describe("FetchError", () => {
  it("should create FetchError with correct properties", () => {
    const mockResponse = new Response(null, {
      status: 404,
      statusText: "Not Found",
    });

    const error = new FetchError(
      "HTTP 404: Not Found",
      404,
      "Not Found",
      mockResponse
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(FetchError);
    expect(error.name).toBe("FetchError");
    expect(error.message).toBe("HTTP 404: Not Found");
    expect(error.status).toBe(404);
    expect(error.statusText).toBe("Not Found");
    expect(error.response).toBe(mockResponse);
  });

  it("should be throwable and catchable", () => {
    const mockResponse = new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });

    expect(() => {
      throw new FetchError(
        "Server error",
        500,
        "Internal Server Error",
        mockResponse
      );
    }).toThrow(FetchError);
  });
});
