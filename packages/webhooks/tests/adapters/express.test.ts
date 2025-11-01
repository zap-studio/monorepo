// biome-ignore-all lint/style/noNonNullAssertion: Test file where we know values exist
// biome-ignore-all lint/style/noMagicNumbers: Test file where magic numbers are acceptable

import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { expressAdapter } from "../../src/adapters/express";
import type { NormalizedRequest, NormalizedResponse } from "../../src/types";

describe("ExpressAdapter", () => {
  describe("toNormalizedRequest", () => {
    it("should convert Express request to NormalizedRequest", async () => {
      const mockReq = {
        method: "POST",
        path: "/webhook/payment",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer token123",
        },
        body: Buffer.from(JSON.stringify({ id: "123", amount: 100 })),
        query: { source: "api" },
        params: { id: "payment" },
      } as unknown as Request;

      const normalized = await expressAdapter.toNormalizedRequest(mockReq);

      expect(normalized.method).toBe("POST");
      expect(normalized.path).toBe("/webhook/payment");
      expect(normalized.headers).toBeInstanceOf(Headers);
      expect(normalized.headers.get("content-type")).toBe("application/json");
      expect(normalized.headers.get("authorization")).toBe("Bearer token123");
      expect(normalized.rawBody).toBeInstanceOf(Buffer);
      expect(normalized.rawBody.toString()).toBe(
        JSON.stringify({ id: "123", amount: 100 })
      );
      expect(normalized.json).toEqual({ id: "123", amount: 100 });
      expect(normalized.query).toEqual({ source: "api" });
      expect(normalized.params).toEqual({ id: "payment" });
    });

    it("should handle Buffer body", async () => {
      const bodyData = { test: "data" };
      const mockReq = {
        method: "POST",
        path: "/webhook",
        headers: { "content-type": "application/json" },
        body: Buffer.from(JSON.stringify(bodyData)),
        query: {},
        params: {},
      } as unknown as Request;

      const normalized = await expressAdapter.toNormalizedRequest(mockReq);

      expect(normalized.rawBody).toBeInstanceOf(Buffer);
      expect(normalized.rawBody.toString()).toBe(JSON.stringify(bodyData));
      expect(normalized.json).toEqual(bodyData);
    });

    it("should handle string body", async () => {
      const bodyData = '{"test":"data"}';
      const mockReq = {
        method: "POST",
        path: "/webhook",
        headers: { "content-type": "application/json" },
        body: bodyData,
        query: {},
        params: {},
      } as unknown as Request;

      const normalized = await expressAdapter.toNormalizedRequest(mockReq);

      expect(normalized.rawBody).toBeInstanceOf(Buffer);
      expect(normalized.rawBody.toString()).toBe(bodyData);
      // String bodies are not parsed to JSON by the adapter
      expect(normalized.json).toBeUndefined();
    });

    it("should handle already parsed JSON object body", async () => {
      const bodyData = { test: "data", nested: { value: 42 } };
      const mockReq = {
        method: "POST",
        path: "/webhook",
        headers: { "content-type": "application/json" },
        body: bodyData,
        query: {},
        params: {},
      } as unknown as Request;

      const normalized = await expressAdapter.toNormalizedRequest(mockReq);

      expect(normalized.rawBody).toBeInstanceOf(Buffer);
      expect(normalized.rawBody.toString()).toBe(JSON.stringify(bodyData));
      expect(normalized.json).toEqual(bodyData);
    });

    it("should handle empty body", async () => {
      const mockReq = {
        method: "POST",
        path: "/webhook",
        headers: {},
        body: undefined,
        query: {},
        params: {},
      } as unknown as Request;

      const normalized = await expressAdapter.toNormalizedRequest(mockReq);

      expect(normalized.rawBody).toBeInstanceOf(Buffer);
      expect(normalized.rawBody.length).toBe(0);
      expect(normalized.json).toBeUndefined();
    });

    it("should handle null body", async () => {
      const mockReq = {
        method: "POST",
        path: "/webhook",
        headers: {},
        body: null,
        query: {},
        params: {},
      } as unknown as Request;

      const normalized = await expressAdapter.toNormalizedRequest(mockReq);

      expect(normalized.rawBody).toBeInstanceOf(Buffer);
      expect(normalized.rawBody.length).toBe(0);
      expect(normalized.json).toBeUndefined();
    });

    it("should convert headers with array values", async () => {
      const mockReq = {
        method: "POST",
        path: "/webhook",
        headers: {
          "x-custom-header": ["value1", "value2", "value3"],
          "content-type": "application/json",
        },
        body: Buffer.from("{}"),
        query: {},
        params: {},
      } as unknown as Request;

      const normalized = await expressAdapter.toNormalizedRequest(mockReq);

      expect(normalized.headers.get("x-custom-header")).toBe(
        "value1, value2, value3"
      );
      expect(normalized.headers.get("content-type")).toBe("application/json");
    });

    it("should skip undefined and null headers", async () => {
      const mockReq = {
        method: "POST",
        path: "/webhook",
        headers: {
          "x-valid": "value",
          "x-undefined": undefined,
          "x-null": null,
        },
        body: Buffer.from("{}"),
        query: {},
        params: {},
      } as unknown as Request;

      const normalized = await expressAdapter.toNormalizedRequest(mockReq);

      expect(normalized.headers.get("x-valid")).toBe("value");
      expect(normalized.headers.get("x-undefined")).toBeNull();
      expect(normalized.headers.get("x-null")).toBeNull();
    });

    it("should handle non-JSON content types without parsing", async () => {
      const mockReq = {
        method: "POST",
        path: "/webhook",
        headers: { "content-type": "text/plain" },
        body: Buffer.from("plain text body"),
        query: {},
        params: {},
      } as unknown as Request;

      const normalized = await expressAdapter.toNormalizedRequest(mockReq);

      expect(normalized.rawBody.toString()).toBe("plain text body");
      expect(normalized.json).toBeUndefined();
    });

    it("should handle malformed JSON gracefully", async () => {
      const mockReq = {
        method: "POST",
        path: "/webhook",
        headers: { "content-type": "application/json" },
        body: Buffer.from("{invalid json}"),
        query: {},
        params: {},
      } as unknown as Request;

      const normalized = await expressAdapter.toNormalizedRequest(mockReq);

      expect(normalized.rawBody.toString()).toBe("{invalid json}");
      expect(normalized.json).toBeUndefined();
    });

    it("should handle all HTTP methods", async () => {
      const methods: Array<
        | "GET"
        | "HEAD"
        | "POST"
        | "PUT"
        | "DELETE"
        | "CONNECT"
        | "OPTIONS"
        | "TRACE"
        | "PATCH"
      > = [
        "GET",
        "HEAD",
        "POST",
        "PUT",
        "DELETE",
        "CONNECT",
        "OPTIONS",
        "TRACE",
        "PATCH",
      ];

      for (const method of methods) {
        const mockReq = {
          method,
          path: "/webhook",
          headers: {},
          body: Buffer.from("{}"),
          query: {},
          params: {},
        } as unknown as Request;

        const normalized = await expressAdapter.toNormalizedRequest(mockReq);

        expect(normalized.method).toBe(method);
      }
    });

    it("should handle complex query parameters", async () => {
      const mockReq = {
        method: "GET",
        path: "/webhook",
        headers: {},
        body: Buffer.from(""),
        query: {
          single: "value",
          multiple: ["value1", "value2"],
          number: "123",
        },
        params: {},
      } as unknown as Request;

      const normalized = await expressAdapter.toNormalizedRequest(mockReq);

      expect(normalized.query).toEqual({
        single: "value",
        multiple: ["value1", "value2"],
        number: "123",
      });
    });

    it("should handle route parameters", async () => {
      const mockReq = {
        method: "POST",
        path: "/webhook/user/123",
        headers: {},
        body: Buffer.from("{}"),
        query: {},
        params: { resource: "user", id: "123" },
      } as unknown as Request;

      const normalized = await expressAdapter.toNormalizedRequest(mockReq);

      expect(normalized.params).toEqual({ resource: "user", id: "123" });
    });
  });

  describe("toFrameworkResponse", () => {
    const createMockResponse = () => {
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
        end: vi.fn().mockReturnThis(),
        setHeader: vi.fn().mockReturnThis(),
      } as unknown as Response;
      return res;
    };

    it("should convert NormalizedResponse to Express response", async () => {
      const mockRes = createMockResponse();
      const normalizedResponse: NormalizedResponse = {
        status: 200,
        body: { success: true },
      };

      await expressAdapter.toFrameworkResponse(mockRes, normalizedResponse);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });

    it("should handle string body", async () => {
      const mockRes = createMockResponse();
      const normalizedResponse: NormalizedResponse = {
        status: 200,
        body: "plain text response",
      };

      await expressAdapter.toFrameworkResponse(mockRes, normalizedResponse);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith("plain text response");
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("should handle number body", async () => {
      const mockRes = createMockResponse();
      const normalizedResponse: NormalizedResponse = {
        status: 200,
        body: 42,
      };

      await expressAdapter.toFrameworkResponse(mockRes, normalizedResponse);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith(42);
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("should handle object body", async () => {
      const mockRes = createMockResponse();
      const normalizedResponse: NormalizedResponse = {
        status: 201,
        body: { id: "123", created: true },
      };

      await expressAdapter.toFrameworkResponse(mockRes, normalizedResponse);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ id: "123", created: true });
    });

    it("should handle undefined body", async () => {
      const mockRes = createMockResponse();
      const normalizedResponse: NormalizedResponse = {
        status: 204,
      };

      await expressAdapter.toFrameworkResponse(mockRes, normalizedResponse);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.end).toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
      expect(mockRes.send).not.toHaveBeenCalled();
    });

    it("should set custom headers", async () => {
      const mockRes = createMockResponse();
      const headers = new Headers();
      headers.set("X-Custom-Header", "custom-value");
      headers.set("X-Request-Id", "req-123");

      const normalizedResponse: NormalizedResponse = {
        status: 200,
        body: { success: true },
        headers,
      };

      await expressAdapter.toFrameworkResponse(mockRes, normalizedResponse);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "x-custom-header",
        "custom-value"
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith("x-request-id", "req-123");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });

    it("should handle different status codes", async () => {
      const statusCodes = [200, 201, 204, 400, 401, 403, 404, 500];

      for (const statusCode of statusCodes) {
        const mockRes = createMockResponse();
        const normalizedResponse: NormalizedResponse = {
          status: statusCode,
          body: { status: statusCode },
        };

        await expressAdapter.toFrameworkResponse(mockRes, normalizedResponse);

        expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      }
    });

    it("should handle null body as non-object", async () => {
      const mockRes = createMockResponse();
      const normalizedResponse: NormalizedResponse = {
        status: 200,
        body: null,
      };

      await expressAdapter.toFrameworkResponse(mockRes, normalizedResponse);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      // null is treated as a non-object primitive in the adapter
      expect(mockRes.send).toHaveBeenCalledWith(null);
    });

    it("should handle boolean body", async () => {
      const mockRes = createMockResponse();
      const normalizedResponse: NormalizedResponse = {
        status: 200,
        body: true,
      };

      await expressAdapter.toFrameworkResponse(mockRes, normalizedResponse);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith(true);
    });

    it("should handle empty object body", async () => {
      const mockRes = createMockResponse();
      const normalizedResponse: NormalizedResponse = {
        status: 200,
        body: {},
      };

      await expressAdapter.toFrameworkResponse(mockRes, normalizedResponse);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({});
    });

    it("should handle array body", async () => {
      const mockRes = createMockResponse();
      const normalizedResponse: NormalizedResponse = {
        status: 200,
        body: [1, 2, 3],
      };

      await expressAdapter.toFrameworkResponse(mockRes, normalizedResponse);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([1, 2, 3]);
    });

    it("should handle nested object body", async () => {
      const mockRes = createMockResponse();
      const normalizedResponse: NormalizedResponse = {
        status: 200,
        body: {
          user: { id: "123", name: "John" },
          metadata: { timestamp: 1_234_567_890 },
        },
      };

      await expressAdapter.toFrameworkResponse(mockRes, normalizedResponse);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        user: { id: "123", name: "John" },
        metadata: { timestamp: 1_234_567_890 },
      });
    });
  });

  describe("handleWebhook", () => {
    const createMockRequest = (
      path: string,
      body: unknown,
      method = "POST",
      headers: Record<string, string> = {}
    ): Request =>
      ({
        method,
        path,
        headers: {
          "content-type": "application/json",
          ...headers,
        },
        body: Buffer.from(JSON.stringify(body)),
        query: {},
        params: {},
      }) as unknown as Request;

    const createMockResponse = () => {
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
        end: vi.fn().mockReturnThis(),
        setHeader: vi.fn().mockReturnThis(),
      } as unknown as Response;
      return res;
    };

    it("should handle webhook request through router", async () => {
      const mockRouter = {
        handle: vi.fn().mockResolvedValue({
          status: 200,
          body: { success: true },
        }),
      };

      const handler = expressAdapter.handleWebhook(mockRouter);
      const mockReq = createMockRequest("/webhook/payment", {
        id: "123",
        amount: 100,
      });
      const mockRes = createMockResponse();

      await handler(mockReq, mockRes);

      expect(mockRouter.handle).toHaveBeenCalledTimes(1);
      const normalizedRequest = mockRouter.handle.mock
        .calls[0]![0] as NormalizedRequest;
      expect(normalizedRequest.method).toBe("POST");
      expect(normalizedRequest.path).toBe("/webhook/payment");
      expect(normalizedRequest.json).toEqual({ id: "123", amount: 100 });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });

    it("should pass through error responses", async () => {
      const mockRouter = {
        handle: vi.fn().mockResolvedValue({
          status: 400,
          body: { error: "validation failed" },
        }),
      };

      const handler = expressAdapter.handleWebhook(mockRouter);
      const mockReq = createMockRequest("/webhook/payment", { invalid: true });
      const mockRes = createMockResponse();

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "validation failed" });
    });

    it("should handle 404 responses", async () => {
      const mockRouter = {
        handle: vi.fn().mockResolvedValue({
          status: 404,
          body: { error: "not found" },
        }),
      };

      const handler = expressAdapter.handleWebhook(mockRouter);
      const mockReq = createMockRequest("/unknown", {});
      const mockRes = createMockResponse();

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "not found" });
    });

    it("should handle custom headers in response", async () => {
      const headers = new Headers();
      headers.set("X-Webhook-Id", "webhook-123");

      const mockRouter = {
        handle: vi.fn().mockResolvedValue({
          status: 200,
          body: { success: true },
          headers,
        }),
      };

      const handler = expressAdapter.handleWebhook(mockRouter);
      const mockReq = createMockRequest("/webhook", { data: "test" });
      const mockRes = createMockResponse();

      await handler(mockReq, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "x-webhook-id",
        "webhook-123"
      );
    });

    it("should handle empty response body", async () => {
      const mockRouter = {
        handle: vi.fn().mockResolvedValue({
          status: 204,
        }),
      };

      const handler = expressAdapter.handleWebhook(mockRouter);
      const mockReq = createMockRequest("/webhook", { data: "test" });
      const mockRes = createMockResponse();

      await handler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.end).toHaveBeenCalled();
    });

    it("should convert Express request with string body", async () => {
      const mockRouter = {
        handle: vi.fn().mockResolvedValue({
          status: 200,
          body: "ok",
        }),
      };

      const handler = expressAdapter.handleWebhook(mockRouter);
      const mockReq = {
        method: "POST",
        path: "/webhook",
        headers: { "content-type": "application/json" },
        body: '{"test":"data"}',
        query: {},
        params: {},
      } as unknown as Request;
      const mockRes = createMockResponse();

      await handler(mockReq, mockRes);

      expect(mockRouter.handle).toHaveBeenCalledTimes(1);
      const normalizedRequest = mockRouter.handle.mock
        .calls[0]![0] as NormalizedRequest;
      expect(normalizedRequest.rawBody.toString()).toBe('{"test":"data"}');
      // String bodies are not parsed to JSON by the adapter
      expect(normalizedRequest.json).toBeUndefined();
    });

    it("should handle GET requests", async () => {
      const mockRouter = {
        handle: vi.fn().mockResolvedValue({
          status: 200,
          body: { message: "GET request handled" },
        }),
      };

      const handler = expressAdapter.handleWebhook(mockRouter);
      const mockReq = createMockRequest("/webhook", {}, "GET");
      const mockRes = createMockResponse();

      await handler(mockReq, mockRes);

      expect(mockRouter.handle).toHaveBeenCalledTimes(1);
      const normalizedRequest = mockRouter.handle.mock
        .calls[0]![0] as NormalizedRequest;
      expect(normalizedRequest.method).toBe("GET");
    });

    it("should preserve request headers in normalized request", async () => {
      const mockRouter = {
        handle: vi.fn().mockResolvedValue({
          status: 200,
          body: "ok",
        }),
      };

      const handler = expressAdapter.handleWebhook(mockRouter);
      const mockReq = createMockRequest("/webhook", {}, "POST", {
        authorization: "Bearer token123",
        "x-custom": "custom-value",
      });
      const mockRes = createMockResponse();

      await handler(mockReq, mockRes);

      const normalizedRequest = mockRouter.handle.mock
        .calls[0]![0] as NormalizedRequest;
      expect(normalizedRequest.headers.get("authorization")).toBe(
        "Bearer token123"
      );
      expect(normalizedRequest.headers.get("x-custom")).toBe("custom-value");
    });

    it("should handle async router handle function", async () => {
      let asyncExecuted = false;

      const mockRouter = {
        handle: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          asyncExecuted = true;
          return { status: 200, body: "ok" };
        },
      };

      const handler = expressAdapter.handleWebhook(mockRouter);
      const mockReq = createMockRequest("/webhook", { data: "test" });
      const mockRes = createMockResponse();

      await handler(mockReq, mockRes);

      expect(asyncExecuted).toBe(true);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should handle multiple webhook calls", async () => {
      const mockRouter = {
        handle: vi.fn().mockResolvedValue({
          status: 200,
          body: "ok",
        }),
      };

      const handler = expressAdapter.handleWebhook(mockRouter);

      for (let i = 0; i < 5; i += 1) {
        const mockReq = createMockRequest("/webhook", { id: i });
        const mockRes = createMockResponse();
        await handler(mockReq, mockRes);
      }

      expect(mockRouter.handle).toHaveBeenCalledTimes(5);
    });

    it("should create new handler for each call to handleWebhook", () => {
      const mockRouter = {
        handle: vi.fn().mockResolvedValue({
          status: 200,
          body: "ok",
        }),
      };

      const handler1 = expressAdapter.handleWebhook(mockRouter);
      const handler2 = expressAdapter.handleWebhook(mockRouter);

      expect(handler1).not.toBe(handler2);
      expect(typeof handler1).toBe("function");
      expect(typeof handler2).toBe("function");
    });
  });

  describe("Integration", () => {
    it("should handle complete webhook flow", async () => {
      const receivedPayloads: unknown[] = [];

      const mockRouter = {
        handle: async (req: NormalizedRequest) => {
          receivedPayloads.push(req.json);
          return await Promise.resolve({
            status: 200,
            body: { received: true, path: req.path },
          });
        },
      };

      const handler = expressAdapter.handleWebhook(mockRouter);

      const mockReq = {
        method: "POST",
        path: "/webhook/payment",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer secret",
        },
        body: Buffer.from(JSON.stringify({ id: "pay_123", amount: 100 })),
        query: { source: "stripe" },
        params: { event: "payment" },
      } as unknown as Request;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
        end: vi.fn().mockReturnThis(),
        setHeader: vi.fn().mockReturnThis(),
      } as unknown as Response;

      await handler(mockReq, mockRes);

      expect(receivedPayloads).toHaveLength(1);
      expect(receivedPayloads[0]).toEqual({ id: "pay_123", amount: 100 });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        received: true,
        path: "/webhook/payment",
      });
    });
  });
});
