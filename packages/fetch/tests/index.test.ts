import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import { safeFetch, api } from "../src";
import { FetchError } from "../src/errors";

describe("safeFetch", () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn();
		global.fetch = fetchMock;
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
				headers: {},
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
				}),
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
				}),
			);
		});

		it("should handle FormData body without setting Content-Type", async () => {
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
					headers: {}, // No Content-Type for FormData
				}),
			);
		});

		it("should handle string body with text/plain Content-Type", async () => {
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
					headers: {
						"Content-Type": "text/plain",
					},
				}),
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
				}),
			);
		});
	});

	describe("response types", () => {
		it("should handle text responses", async () => {
			const schema = z.string();
			const mockText = "Plain text response";

			fetchMock.mockResolvedValue({
				ok: true,
				status: 200,
				statusText: "OK",
				text: async () => mockText,
			});

			const result = await safeFetch("https://api.example.com/text", schema, {
				responseType: "text",
			});

			expect(result).toBe(mockText);
		});

		it("should handle blob responses", async () => {
			const schema = z.instanceof(Blob);
			const mockBlob = new Blob(["test content"]);

			fetchMock.mockResolvedValue({
				ok: true,
				status: 200,
				statusText: "OK",
				blob: async () => mockBlob,
			});

			const result = await safeFetch("https://api.example.com/file", schema, {
				responseType: "blob",
			});

			expect(result).toBe(mockBlob);
		});

		it("should handle arrayBuffer responses", async () => {
			const schema = z.instanceof(ArrayBuffer);
			const mockBuffer = new ArrayBuffer(8);

			fetchMock.mockResolvedValue({
				ok: true,
				status: 200,
				statusText: "OK",
				arrayBuffer: async () => mockBuffer,
			});

			const result = await safeFetch("https://api.example.com/binary", schema, {
				responseType: "arrayBuffer",
			});

			expect(result).toBe(mockBuffer);
		});

		it("should handle formData responses", async () => {
			const schema = z.instanceof(FormData);
			const mockFormData = new FormData();
			mockFormData.append("key", "value");

			fetchMock.mockResolvedValue({
				ok: true,
				status: 200,
				statusText: "OK",
				formData: async () => mockFormData,
			});

			const result = await safeFetch("https://api.example.com/form", schema, {
				responseType: "formData",
			});

			expect(result).toBe(mockFormData);
		});

		it("should default to JSON response type", async () => {
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
				}),
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

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBeDefined();
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

			expect(result.success).toBe(true);
			if (result.success) {
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
				safeFetch("https://api.example.com/notfound", schema),
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
				safeFetch("https://api.example.com/error", schema),
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
				}),
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
				}),
			);
		});
	});
});

describe("api convenience methods", () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn();
		global.fetch = fetchMock;
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
			}),
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
			body,
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
			}),
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
			body,
		);

		expect(result).toEqual(mockData);
		expect(fetchMock).toHaveBeenCalledWith(
			"https://api.example.com/items/123",
			expect.objectContaining({
				method: "PUT",
				body: JSON.stringify(body),
			}),
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
			body,
		);

		expect(result).toEqual(mockData);
		expect(fetchMock).toHaveBeenCalledWith(
			"https://api.example.com/items/123",
			expect.objectContaining({
				method: "PATCH",
				body: JSON.stringify(body),
			}),
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
			schema,
		);

		expect(result).toEqual(mockData);
		expect(fetchMock).toHaveBeenCalledWith(
			"https://api.example.com/items/123",
			expect.objectContaining({
				method: "DELETE",
			}),
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
			}),
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
			mockResponse,
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
				mockResponse,
			);
		}).toThrow(FetchError);
	});
});
