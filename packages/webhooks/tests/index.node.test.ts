import type { StandardSchemaV1 } from "@zap-studio/validation";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { VerificationError } from "../src/errors.js";
import { createWebhookRouter, WebhookRouter } from "../src/index.js";
import type {
  NormalizedRequest,
  NormalizedResponse,
} from "../src/types/index.js";
import { createHmacVerifier } from "../src/verify.js";

describe(WebhookRouter, () => {
  const encoder = new TextEncoder();

  const createMockRequest = (
    path: string,
    body: unknown,
    method: "POST" | "GET" = "POST"
  ): NormalizedRequest => ({
    headers: new Headers(),
    method,
    path,
    rawBody: encoder.encode(JSON.stringify(body)),
  });

  describe("Basic routing", () => {
    it("should support schema-first route registration at creation time", async () => {
      const router = createWebhookRouter();
      router.register("payment", {
        handler: async ({ payload, ack }) =>
          await ack({ body: payload.amount, status: 200 }),
        schema: z.object({
          amount: z.number(),
        }),
      });

      const response = await router.handle(
        createMockRequest("/webhooks/payment", { amount: 100 })
      );

      expect(response).toStrictEqual({ body: 100, status: 200 });
    });

    it("should handle webhook without schema validation", async () => {
      interface WebhookMap {
        test: { id: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("test", async ({ payload, ack }) => {
        expect(payload).toStrictEqual({ id: "123" });
        return await ack({ body: "success", status: 200 });
      });

      const response = await router.handle(
        createMockRequest("/webhooks/test", { id: "123" })
      );

      expect(response).toStrictEqual({ body: "success", status: 200 });
    });

    it("should return 404 for unregistered paths", async () => {
      interface WebhookMap {
        test: { id: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      const response = await router.handle(
        createMockRequest("/webhooks/unknown", { id: "123" })
      );

      expect(response).toStrictEqual({
        body: { error: "not found" },
        status: 404,
      });
    });

    it("should return 404 for paths without /webhooks/ prefix", async () => {
      interface WebhookMap {
        test: { id: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register(
        "test",
        async ({ ack }) => await ack({ body: "success", status: 200 })
      );

      const response = await router.handle(
        createMockRequest("/test", { id: "123" })
      );

      expect(response).toStrictEqual({
        body: { error: "not found" },
        status: 404,
      });
    });

    it("should handle multiple registered paths", async () => {
      interface WebhookMap {
        order: { id: string };
        payment: { amount: number };
        user: { name: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("payment", {
        handler: async ({ payload, ack }) =>
          await ack({ body: { received: payload.amount }, status: 200 }),
        schema: z.object({ amount: z.number() }),
      });

      router.register("user", {
        handler: async ({ payload, ack }) =>
          await ack({
            body: { greeting: `Hello ${payload.name}` },
            status: 200,
          }),
        schema: z.object({ name: z.string() }),
      });

      router.register("order", {
        handler: async ({ payload, ack }) =>
          await ack({ body: { orderId: payload.id }, status: 200 }),
        schema: z.object({ id: z.string() }),
      });

      const paymentResponse = await router.handle(
        createMockRequest("/webhooks/payment", { amount: 100 })
      );
      expect(paymentResponse).toStrictEqual({
        body: { received: 100 },
        status: 200,
      });

      const userResponse = await router.handle(
        createMockRequest("/webhooks/user", { name: "Alice" })
      );
      expect(userResponse).toStrictEqual({
        body: { greeting: "Hello Alice" },
        status: 200,
      });

      const orderResponse = await router.handle(
        createMockRequest("/webhooks/order", { id: "order_123" })
      );
      expect(orderResponse).toStrictEqual({
        body: { orderId: "order_123" },
        status: 200,
      });
    });

    it("should handle request without explicit response", async () => {
      interface WebhookMap {
        silent: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("silent", () => ({ body: "ok", status: 200 }));

      const response = await router.handle(
        createMockRequest("/webhooks/silent", { data: "test" })
      );

      expect(response).toStrictEqual({ body: "ok", status: 200 });
    });

    it("should preserve request metadata in handler", async () => {
      interface WebhookMap {
        metadata: { value: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("metadata", async ({ req, ack }) => {
        expect(req.method).toBe("POST");
        expect(req.path).toBe("/metadata");
        expect(req.headers).toBeInstanceOf(Headers);
        expect(req.rawBody).toBeInstanceOf(Uint8Array);
        expect(req.json).toBeDefined();
        return await ack({ status: 200 });
      });

      await router.handle(
        createMockRequest("/webhooks/metadata", { value: "test" })
      );
    });

    it("should use default ack response values when ack is called without args", async () => {
      interface WebhookMap {
        default: { value: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("default", async ({ ack }) => await ack());

      const response = await router.handle(
        createMockRequest("/webhooks/default", { value: "test" })
      );

      expect(response).toStrictEqual({
        body: "ok",
        headers: undefined,
        status: 200,
      });
    });

    it("should return default response when handler returns undefined", async () => {
      interface WebhookMap {
        empty: { value: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("empty", async () => {
        await Promise.resolve();
        const result: { response?: NormalizedResponse } = {};
        return result.response;
      });

      const response = await router.handle(
        createMockRequest("/webhooks/empty", { value: "test" })
      );

      expect(response).toStrictEqual({ body: "ok", status: 200 });
    });
  });

  describe("Schema validation with Zod", () => {
    it("should validate payload with Zod schema", async () => {
      interface WebhookMap {
        payment: { id: string; amount: number };
      }

      const router = new WebhookRouter<WebhookMap>();

      const paymentSchema = z.object({
        amount: z.number().positive(),
        id: z.string(),
      });

      router.register("payment", {
        handler: async ({ payload, ack }) => {
          expect(payload).toStrictEqual({ amount: 100, id: "pay_123" });
          return await ack({ body: "payment processed", status: 200 });
        },
        schema: paymentSchema,
      });

      const response = await router.handle(
        createMockRequest("/webhooks/payment", { amount: 100, id: "pay_123" })
      );

      expect(response).toStrictEqual({
        body: "payment processed",
        status: 200,
      });
    });

    it("should reject invalid payload when schema is provided", async () => {
      interface WebhookMap {
        payment: { id: string; amount: number };
      }

      const router = new WebhookRouter<WebhookMap>();

      const paymentSchema = z.object({
        amount: z.number().positive(),
        id: z.string(),
      });

      router.register("payment", {
        handler: async ({ ack }) => await ack({ status: 200 }),
        schema: paymentSchema,
      });

      const response = await router.handle(
        createMockRequest("/webhooks/payment", { amount: -100, id: "pay_123" })
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "validation failed");
      expect(response.body).toHaveProperty("issues");
    });

    it("should reject payload with missing required fields", async () => {
      interface WebhookMap {
        user: { id: string; email: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      const userSchema = z.object({
        email: z.email(),
        id: z.string(),
      });

      router.register("user", {
        handler: async ({ ack }) => await ack({ status: 200 }),
        schema: userSchema,
      });

      const response = await router.handle(
        createMockRequest("/webhooks/user", { id: "123" })
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "validation failed");
    });

    it("should validate complex nested schemas", async () => {
      interface WebhookMap {
        order: {
          id: string;
          items: { sku: string; quantity: number }[];
          customer: { email: string; name: string };
        };
      }

      const router = new WebhookRouter<WebhookMap>();

      const orderSchema = z.object({
        customer: z.object({
          email: z.email(),
          name: z.string().min(1),
        }),
        id: z.string(),
        items: z.array(
          z.object({
            quantity: z.number().int().positive(),
            sku: z.string(),
          })
        ),
      });

      router.register("order", {
        handler: async ({ payload, ack }) => {
          expect(payload.items).toHaveLength(2);
          expect(payload.customer.email).toBe("test@example.com");
          return await ack({ status: 200 });
        },
        schema: orderSchema,
      });

      const validOrder = {
        customer: {
          email: "test@example.com",
          name: "John Doe",
        },
        id: "order_123",
        items: [
          { quantity: 2, sku: "WIDGET-1" },
          { quantity: 1, sku: "GADGET-5" },
        ],
      };

      const response = await router.handle(
        createMockRequest("/webhooks/order", validOrder)
      );

      expect(response.status).toBe(200);
    });

    it("should transform data with Zod transforms", async () => {
      interface WebhookMap {
        data: { value: number };
      }

      const router = new WebhookRouter<WebhookMap>();

      const schema = z.object({
        value: z.string().transform((val) => Math.trunc(Number(val))),
      });

      router.register("data", {
        handler: async ({ payload, ack }) => {
          expect(payload.value).toBeTypeOf("number");
          expect(payload.value).toBe(42);
          return await ack({ status: 200 });
        },
        schema,
      });

      const response = await router.handle(
        createMockRequest("/webhooks/data", { value: "42" })
      );

      expect(response.status).toBe(200);
    });
  });

  describe("Custom schema validator", () => {
    it("should work with custom Standard Schema validator", async () => {
      interface WebhookMap {
        custom: { value: number };
      }

      const router = new WebhookRouter<WebhookMap>();

      // Custom Standard Schema validator that ensures value is between 1 and 100
      const customValidator: StandardSchemaV1<unknown, { value: number }> = {
        "~standard": {
          validate: (data: unknown) => {
            const obj = data as { value?: unknown };
            if (
              typeof obj.value !== "number" ||
              obj.value < 1 ||
              obj.value > 100
            ) {
              return {
                issues: [
                  {
                    message: "Value must be a number between 1 and 100",
                    path: ["value"],
                  },
                ],
              };
            }
            return {
              value: { value: obj.value },
            };
          },
          vendor: "custom",
          version: 1,
        },
      };

      router.register("custom", {
        handler: async ({ payload, ack }) => {
          expect(payload.value).toBe(50);
          return await ack({ status: 200 });
        },
        schema: customValidator,
      });

      const validResponse = await router.handle(
        createMockRequest("/webhooks/custom", { value: 50 })
      );
      expect(validResponse.status).toBe(200);

      const invalidResponse = await router.handle(
        createMockRequest("/webhooks/custom", { value: 150 })
      );
      expect(invalidResponse.status).toBe(400);
      expect(invalidResponse.body).toHaveProperty("error", "validation failed");
    });

    it("should support async validators", async () => {
      interface WebhookMap {
        async: { id: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      // Async Standard Schema validator that simulates database check
      const asyncValidator: StandardSchemaV1<unknown, { id: string }> = {
        "~standard": {
          validate: async (data: unknown) => {
            const obj = data as { id?: unknown };

            await Promise.resolve();

            if (typeof obj.id !== "string" || !obj.id.startsWith("valid_")) {
              return {
                issues: [
                  {
                    message: "ID must start with 'valid_'",
                    path: ["id"],
                  },
                ],
              };
            }

            return {
              value: { id: obj.id },
            };
          },
          vendor: "custom",
          version: 1,
        },
      };

      router.register("async", {
        handler: async ({ payload, ack }) => {
          expect(payload.id).toBe("valid_123");
          return await ack({ status: 200 });
        },
        schema: asyncValidator,
      });

      const validResponse = await router.handle(
        createMockRequest("/webhooks/async", { id: "valid_123" })
      );
      expect(validResponse.status).toBe(200);

      const invalidResponse = await router.handle(
        createMockRequest("/webhooks/async", { id: "invalid_123" })
      );
      expect(invalidResponse.status).toBe(400);
    });

    it("should map object path segments from schema issues", async () => {
      interface WebhookMap {
        keyed: { value: number };
      }

      const router = new WebhookRouter<WebhookMap>();

      const objectPathValidator: StandardSchemaV1<unknown, { value: number }> =
        {
          "~standard": {
            validate: () => ({
              issues: [
                {
                  message: "Invalid nested value",
                  path: [{ key: "nested" }],
                },
              ],
            }),
            vendor: "custom",
            version: 1,
          },
        };

      router.register("keyed", {
        handler: async ({ ack }) => await ack({ status: 200 }),
        schema: objectPathValidator,
      });

      const response = await router.handle(
        createMockRequest("/webhooks/keyed", { value: 1 })
      );

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        error: "validation failed",
        issues: [{ message: "Invalid nested value", path: ["nested"] }],
      });
    });
  });

  describe("Request verification", () => {
    it("should work with custom verify function", async () => {
      interface WebhookMap {
        secure: { data: string };
      }

      let verifyWasCalled = false;

      const router = new WebhookRouter<WebhookMap>({
        verify: (req) => {
          verifyWasCalled = true;
          expect(req.path).toBe("/secure");
        },
      });

      router.register("secure", async ({ ack }) => await ack({ status: 200 }));

      await router.handle(
        createMockRequest("/webhooks/secure", { data: "test" })
      );

      expect(verifyWasCalled).toBeTruthy();
    });

    it("should run verify before schema validation", async () => {
      interface WebhookMap {
        verified: { value: number };
      }

      const callOrder: string[] = [];

      const router = new WebhookRouter<WebhookMap>({
        verify: () => {
          callOrder.push("verify");
        },
      });

      const schema = z.object({ value: z.number() });

      router.register("verified", {
        handler: async ({ ack }) => {
          callOrder.push("handler");
          return await ack({ status: 200 });
        },
        schema,
      });

      await router.handle(
        createMockRequest("/webhooks/verified", { value: 42 })
      );

      expect(callOrder).toStrictEqual(["verify", "handler"]);
    });

    it("should support async verify functions", async () => {
      interface WebhookMap {
        "async-verify": { data: string };
      }

      const router = new WebhookRouter<WebhookMap>({
        verify: async (req) => {
          await Promise.resolve();
          expect(req.path).toBe("/async-verify");
        },
      });

      router.register(
        "async-verify",
        async ({ ack }) => await ack({ status: 200 })
      );

      const response = await router.handle(
        createMockRequest("/webhooks/async-verify", { data: "test" })
      );

      expect(response.status).toBe(200);
    });
  });

  describe("Response handling", () => {
    it("should support custom status codes", async () => {
      interface WebhookMap {
        created: { name: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register(
        "created",
        async ({ ack }) => await ack({ body: { created: true }, status: 201 })
      );

      const response = await router.handle(
        createMockRequest("/webhooks/created", { name: "test" })
      );

      expect(response.status).toBe(201);
      expect(response.body).toStrictEqual({ created: true });
    });

    it("should support custom headers", async () => {
      interface WebhookMap {
        headers: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      const customHeaders = new Headers();
      customHeaders.set("X-Custom-Header", "test-value");

      router.register(
        "headers",
        async ({ ack }) =>
          await ack({
            body: "ok",
            headers: customHeaders,
            status: 200,
          })
      );

      const response = await router.handle(
        createMockRequest("/webhooks/headers", { data: "test" })
      );

      expect(response.status).toBe(200);
      expect(response.headers).toBe(customHeaders);
    });

    it("should handle different body types", async () => {
      interface WebhookMap {
        number: { data: string };
        object: { data: string };
        string: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register(
        "string",
        async ({ ack }) => await ack({ body: "plain text", status: 200 })
      );

      router.register(
        "object",
        async ({ ack }) => await ack({ body: { key: "value" }, status: 200 })
      );

      router.register(
        "number",
        async ({ ack }) => await ack({ body: 42, status: 200 })
      );

      const stringResponse = await router.handle(
        createMockRequest("/webhooks/string", { data: "test" })
      );
      expect(stringResponse.body).toBe("plain text");

      const objectResponse = await router.handle(
        createMockRequest("/webhooks/object", { data: "test" })
      );
      expect(objectResponse.body).toStrictEqual({ key: "value" });

      const numberResponse = await router.handle(
        createMockRequest("/webhooks/number", { data: "test" })
      );
      expect(numberResponse.body).toBe(42);
    });
  });

  describe("Error handling", () => {
    it("should handle malformed JSON gracefully", async () => {
      interface WebhookMap {
        json: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("json", async ({ payload, ack }) => {
        expect(payload).toBeUndefined();
        return await ack({ status: 200 });
      });

      const malformedRequest: NormalizedRequest = {
        headers: new Headers(),
        method: "POST",
        path: "/webhooks/json",
        rawBody: encoder.encode("not valid json{"),
      };

      const response = await router.handle(malformedRequest);
      expect(response.status).toBe(200);
    });

    it("should handle empty request body", async () => {
      interface WebhookMap {
        empty: { data?: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("empty", async ({ payload, ack }) => {
        expect(payload).toBeUndefined();
        return await ack({ status: 200 });
      });

      const emptyRequest: NormalizedRequest = {
        headers: new Headers(),
        method: "POST",
        path: "/webhooks/empty",
        rawBody: encoder.encode(""),
      };

      const response = await router.handle(emptyRequest);
      expect(response.status).toBe(200);
    });
  });

  describe("Lifecycle hooks", () => {
    describe("Global before hooks", () => {
      it("should execute before hooks before handler", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        const callOrder: string[] = [];

        const router = new WebhookRouter<WebhookMap>({
          before: (req) => {
            callOrder.push("before");
            expect(req.path).toBe("/test");
          },
        });

        router.register("test", async ({ ack }) => {
          callOrder.push("handler");
          return await ack({ status: 200 });
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(callOrder).toStrictEqual(["before", "handler"]);
      });

      it("should execute multiple before hooks in order", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        const callOrder: string[] = [];

        const router = new WebhookRouter<WebhookMap>({
          before: [
            () => {
              callOrder.push("before-1");
            },
            () => {
              callOrder.push("before-2");
            },
            () => {
              callOrder.push("before-3");
            },
          ],
        });

        router.register("test", async ({ ack }) => {
          callOrder.push("handler");
          return await ack({ status: 200 });
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(callOrder).toStrictEqual([
          "before-1",
          "before-2",
          "before-3",
          "handler",
        ]);
      });

      it("should allow before hooks to enrich request", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        const router = new WebhookRouter<WebhookMap>({
          before: (req) => {
            (req as { metadata?: { timestamp: number } }).metadata = {
              timestamp: Date.now(),
            };
          },
        });

        router.register("test", async ({ req, ack }) => {
          expect(
            (req as { metadata?: { timestamp: number } }).metadata
          ).toBeDefined();
          expect(
            (req as { metadata?: { timestamp: number } }).metadata?.timestamp
          ).toBeTypeOf("number");
          return await ack({ status: 200 });
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );
      });

      it("should stop execution if before hook throws", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        let handlerCalled = false;

        const router = new WebhookRouter<WebhookMap>({
          before: () => {
            throw new Error("Before hook error");
          },
          onError: (error) => ({
            body: { error: error.message },
            status: 400,
          }),
        });

        router.register("test", async ({ ack }) => {
          handlerCalled = true;
          return await ack({ status: 200 });
        });

        const response = await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(handlerCalled).toBeFalsy();
        expect(response.status).toBe(400);
        expect(response.body).toStrictEqual({ error: "Before hook error" });
      });
    });

    describe("Global after hooks", () => {
      it("should execute after hooks after handler", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        const callOrder: string[] = [];

        const router = new WebhookRouter<WebhookMap>({
          after: (req, res) => {
            callOrder.push("after");
            expect(req.path).toBe("/test");
            expect(res.status).toBe(200);
          },
        });

        router.register("test", async ({ ack }) => {
          callOrder.push("handler");
          return await ack({ status: 200 });
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(callOrder).toStrictEqual(["handler", "after"]);
      });

      it("should execute multiple after hooks in order", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        const callOrder: string[] = [];

        const router = new WebhookRouter<WebhookMap>({
          after: [
            () => {
              callOrder.push("after-1");
            },
            () => {
              callOrder.push("after-2");
            },
            () => {
              callOrder.push("after-3");
            },
          ],
        });

        router.register("test", async ({ ack }) => {
          callOrder.push("handler");
          return await ack({ status: 200 });
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(callOrder).toStrictEqual([
          "handler",
          "after-1",
          "after-2",
          "after-3",
        ]);
      });

      it("should receive response in after hooks", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        const router = new WebhookRouter<WebhookMap>({
          after: (_req, res) => {
            expect(res.status).toBe(201);
            expect(res.body).toStrictEqual({ result: "success" });
          },
        });

        router.register(
          "test",
          async ({ ack }) =>
            await ack({ body: { result: "success" }, status: 201 })
        );

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );
      });

      it("should not execute after hooks if handler throws", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        let afterCalled = false;

        const router = new WebhookRouter<WebhookMap>({
          after: () => {
            afterCalled = true;
          },
          onError: () => ({
            body: { error: "Handler error" },
            status: 500,
          }),
        });

        router.register("test", () => {
          throw new Error("Handler error");
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(afterCalled).toBeFalsy();
      });
    });

    describe("Global onError hook", () => {
      it("should execute onError hook when handler throws", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        let errorHookCalled = false;

        const router = new WebhookRouter<WebhookMap>({
          onError: (error, req) => {
            errorHookCalled = true;
            expect(error.message).toBe("Test error");
            expect(req.path).toBe("/test");
            return { body: { error: error.message }, status: 500 };
          },
        });

        router.register("test", () => {
          throw new Error("Test error");
        });

        const response = await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(errorHookCalled).toBeTruthy();
        expect(response.status).toBe(500);
        expect(response.body).toStrictEqual({ error: "Test error" });
      });

      it("should execute onError hook when verify throws", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        let errorHookCalled = false;

        const router = new WebhookRouter<WebhookMap>({
          onError: (error) => {
            errorHookCalled = true;
            expect(error.message).toBe("Verification failed");
            return { body: { error: "Unauthorized" }, status: 401 };
          },
          verify: () => {
            throw new Error("Verification failed");
          },
        });

        router.register("test", async ({ ack }) => await ack({ status: 200 }));

        const response = await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(errorHookCalled).toBeTruthy();
        expect(response.status).toBe(401);
      });

      it("should expose VerificationError to onError when hmac verification fails", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        let receivedError: Error | undefined;

        const router = new WebhookRouter<WebhookMap>({
          onError: (error) => {
            receivedError = error;
            return { body: { error: error.message }, status: 401 };
          },
          verify: createHmacVerifier({
            headerName: "x-hub-signature-256",
            secret: "my-secret",
          }),
        });

        router.register("test", async ({ ack }) => await ack({ status: 200 }));

        const response = await router.handle({
          headers: new Headers({ "x-hub-signature-256": "invalid" }),
          method: "POST",
          path: "/webhooks/test",
          rawBody: encoder.encode(JSON.stringify({ value: "test" })),
        });

        expect(receivedError).toBeInstanceOf(VerificationError);
        expect(receivedError).toMatchObject({
          message: "Invalid signature for header: x-hub-signature-256",
          name: "VerificationError",
        });
        expect(response).toStrictEqual({
          body: { error: "Invalid signature for header: x-hub-signature-256" },
          status: 401,
        });
      });

      it("should execute onError hook when before hook throws", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        let errorHookCalled = false;

        const router = new WebhookRouter<WebhookMap>({
          before: () => {
            throw new Error("Before hook error");
          },
          onError: (error) => {
            errorHookCalled = true;
            return { body: { error: error.message }, status: 400 };
          },
        });

        router.register("test", async ({ ack }) => await ack({ status: 200 }));

        const response = await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(errorHookCalled).toBeTruthy();
        expect(response.status).toBe(400);
      });

      it("should use default error response if onError returns undefined", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        const router = new WebhookRouter<WebhookMap>({
          onError: () => {},
        });

        router.register("test", () => {
          throw new Error("Custom error");
        });

        const response = await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(response.status).toBe(500);
        expect(response.body).toStrictEqual({ error: "Custom error" });
      });

      it("should return internal server error when a non-Error is thrown", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        class NonErrorThrown {
          message = "not-an-error-instance";
        }

        const router = new WebhookRouter<WebhookMap>();

        router.register("test", () => {
          throw new NonErrorThrown();
        });

        const response = await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(response.status).toBe(500);
        expect(response.body).toStrictEqual({ error: "Internal server error" });
      });

      it("should handle different error types", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        const router = new WebhookRouter<WebhookMap>({
          onError: (error) => {
            if (error.message === "Rate limit exceeded") {
              return { body: { error: "Too many requests" }, status: 429 };
            }
            if (error.message === "Unauthorized") {
              return { body: { error: "Forbidden" }, status: 403 };
            }
            return { body: { error: "Internal error" }, status: 500 };
          },
        });

        router.register("test", () => {
          throw new Error("Rate limit exceeded");
        });

        const response = await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(response.status).toBe(429);
        expect(response.body).toStrictEqual({ error: "Too many requests" });
      });
    });

    describe("Route-level hooks", () => {
      it("should execute route-level before hooks after global before hooks", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        const callOrder: string[] = [];

        const router = new WebhookRouter<WebhookMap>({
          before: () => {
            callOrder.push("global-before");
          },
        });

        router.register("test", {
          before: () => {
            callOrder.push("route-before");
          },
          handler: async ({ ack }) => {
            callOrder.push("handler");
            return await ack({ status: 200 });
          },
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(callOrder).toStrictEqual([
          "global-before",
          "route-before",
          "handler",
        ]);
      });

      it("should execute route-level after hooks before global after hooks", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        const callOrder: string[] = [];

        const router = new WebhookRouter<WebhookMap>({
          after: () => {
            callOrder.push("global-after");
          },
        });

        router.register("test", {
          after: () => {
            callOrder.push("route-after");
          },
          handler: async ({ ack }) => {
            callOrder.push("handler");
            return await ack({ status: 200 });
          },
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(callOrder).toStrictEqual([
          "handler",
          "route-after",
          "global-after",
        ]);
      });

      it("should support multiple route-level hooks", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        const callOrder: string[] = [];

        const router = new WebhookRouter<WebhookMap>();

        router.register("test", {
          after: [
            () => {
              callOrder.push("route-after-1");
            },
            () => {
              callOrder.push("route-after-2");
            },
          ],
          before: [
            () => {
              callOrder.push("route-before-1");
            },
            () => {
              callOrder.push("route-before-2");
            },
          ],
          handler: async ({ ack }) => {
            callOrder.push("handler");
            return await ack({ status: 200 });
          },
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(callOrder).toStrictEqual([
          "route-before-1",
          "route-before-2",
          "handler",
          "route-after-1",
          "route-after-2",
        ]);
      });

      it("should handle single hook or array of hooks", async () => {
        interface WebhookMap {
          array: { value: string };
          single: { value: string };
        }

        const callOrder: string[] = [];

        const router = new WebhookRouter<WebhookMap>();

        router.register("single", {
          after: () => {
            callOrder.push("single-after");
          },
          before: () => {
            callOrder.push("single-before");
          },
          handler: async ({ ack }) => await ack({ status: 200 }),
        });

        router.register("array", {
          after: [
            () => {
              callOrder.push("array-after-1");
            },
            () => {
              callOrder.push("array-after-2");
            },
          ],
          before: [
            () => {
              callOrder.push("array-before-1");
            },
            () => {
              callOrder.push("array-before-2");
            },
          ],
          handler: async ({ ack }) => await ack({ status: 200 }),
        });

        await router.handle(
          createMockRequest("/webhooks/single", { value: "test" })
        );
        await router.handle(
          createMockRequest("/webhooks/array", { value: "test" })
        );

        expect(callOrder).toStrictEqual([
          "single-before",
          "single-after",
          "array-before-1",
          "array-before-2",
          "array-after-1",
          "array-after-2",
        ]);
      });
    });

    describe("Complete hook execution order", () => {
      it("should execute all hooks in correct order", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        const callOrder: string[] = [];

        const router = new WebhookRouter<WebhookMap>({
          after: [
            () => {
              callOrder.push("global-after-1");
            },
            () => {
              callOrder.push("global-after-2");
            },
          ],
          before: [
            () => {
              callOrder.push("global-before-1");
            },
            () => {
              callOrder.push("global-before-2");
            },
          ],
          verify: () => {
            callOrder.push("verify");
          },
        });

        const schema = z.object({ value: z.string() });

        router.register("test", {
          after: [
            () => {
              callOrder.push("route-after-1");
            },
            () => {
              callOrder.push("route-after-2");
            },
          ],
          before: [
            () => {
              callOrder.push("route-before-1");
            },
            () => {
              callOrder.push("route-before-2");
            },
          ],
          handler: async ({ ack }) => {
            callOrder.push("handler");
            return await ack({ status: 200 });
          },
          schema,
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(callOrder).toStrictEqual([
          "global-before-1",
          "global-before-2",
          "route-before-1",
          "route-before-2",
          "verify",
          "handler",
          "route-after-1",
          "route-after-2",
          "global-after-1",
          "global-after-2",
        ]);
      });
    });
  });

  describe("Routing with full URLs", () => {
    it("should route correctly with full URL paths", async () => {
      interface WebhookMap {
        fullurl: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register(
        "fullurl",
        async ({ ack }) => await ack({ body: "ok", status: 200 })
      );

      const response = await router.handle(
        createMockRequest("https://example.com/webhooks/fullurl", {
          data: "test",
        })
      );

      expect(response.status).toBe(200);
      expect(response.body).toBe("ok");
    });

    it("should handle URLs with query parameters", async () => {
      interface WebhookMap {
        query: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register(
        "query",
        async ({ ack }) => await ack({ body: "query received", status: 200 })
      );

      const response = await router.handle(
        createMockRequest("https://example.com/webhooks/query?param=value", {
          data: "test",
        })
      );

      expect(response.status).toBe(200);
      expect(response.body).toBe("query received");
    });

    it("should return 404 for unknown full URL paths", async () => {
      interface WebhookMap {
        known: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register(
        "known",
        async ({ ack }) => await ack({ body: "known route", status: 200 })
      );

      const response = await router.handle(
        createMockRequest("https://example.com/webhooks/unknown", {
          data: "test",
        })
      );

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({ error: "not found" });
    });

    it("should preserve full URL in request metadata", async () => {
      interface WebhookMap {
        metadata: { value: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("metadata", async ({ req, ack }) => {
        expect(req.path).toBe("/metadata");
        return await ack({ status: 200 });
      });

      await router.handle(
        createMockRequest("https://example.com/webhooks/metadata", {
          value: "test",
        })
      );
    });
  });

  describe("Path normalization (normalizePath)", () => {
    it("should normalize simple relative paths", async () => {
      interface WebhookMap {
        simple: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("simple", async ({ req, ack }) => {
        expect(req.path).toBe("/simple");
        return await ack({ status: 200 });
      });

      await router.handle(
        createMockRequest("/webhooks/simple", { data: "test" })
      );
    });

    it("should normalize paths without leading slash", async () => {
      interface WebhookMap {
        noslash: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("noslash", async ({ req, ack }) => {
        expect(req.path).toBe("noslash");
        return await ack({ status: 200 });
      });

      await router.handle(createMockRequest("noslash", { data: "test" }));
    });

    it("should extract pathname from full URL", async () => {
      interface WebhookMap {
        extracted: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("extracted", async ({ req, ack }) => {
        expect(req.path).toBe("/extracted");
        return await ack({ status: 200 });
      });

      await router.handle(
        createMockRequest("https://example.com/extracted", { data: "test" })
      );
    });

    it("should strip /webhooks/ prefix from pathname", async () => {
      interface WebhookMap {
        stripped: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("stripped", async ({ req, ack }) => {
        expect(req.path).toBe("/stripped");
        return await ack({ status: 200 });
      });

      await router.handle(
        createMockRequest("/webhooks/stripped", { data: "test" })
      );
    });

    it("should strip /webhooks/ prefix from full URL pathname", async () => {
      interface WebhookMap {
        fullstrip: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("fullstrip", async ({ req, ack }) => {
        expect(req.path).toBe("/fullstrip");
        return await ack({ status: 200 });
      });

      await router.handle(
        createMockRequest("https://example.com/webhooks/fullstrip", {
          data: "test",
        })
      );
    });

    it("should handle paths with /webhooks/ in the middle", async () => {
      interface WebhookMap {
        "api/webhooks/event": { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("api/webhooks/event", async ({ req, ack }) => {
        expect(req.path).toBe("/api/webhooks/event");
        return await ack({ status: 200 });
      });

      await router.handle(
        createMockRequest("/webhooks/api/webhooks/event", { data: "test" })
      );
    });

    it("should preserve query parameters in full URL", async () => {
      interface WebhookMap {
        withquery: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("withquery", async ({ req, ack }) => {
        expect(req.path).toBe("/withquery");
        return await ack({ status: 200 });
      });

      await router.handle(
        createMockRequest(
          "https://example.com/webhooks/withquery?foo=bar&baz=qux",
          {
            data: "test",
          }
        )
      );
    });

    it("should handle URL with hash fragment", async () => {
      interface WebhookMap {
        withhash: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("withhash", async ({ req, ack }) => {
        expect(req.path).toBe("/withhash");
        return await ack({ status: 200 });
      });

      await router.handle(
        createMockRequest("https://example.com/webhooks/withhash#section", {
          data: "test",
        })
      );
    });

    it("should handle nested paths after /webhooks/ prefix", async () => {
      interface WebhookMap {
        "api/v1/events": { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("api/v1/events", async ({ req, ack }) => {
        expect(req.path).toBe("/api/v1/events");
        return await ack({ status: 200 });
      });

      await router.handle(
        createMockRequest("/webhooks/api/v1/events", { data: "test" })
      );
    });

    it("should handle URL with port number", async () => {
      interface WebhookMap {
        withport: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("withport", async ({ req, ack }) => {
        expect(req.path).toBe("/withport");
        return await ack({ status: 200 });
      });

      await router.handle(
        createMockRequest("https://example.com:8080/webhooks/withport", {
          data: "test",
        })
      );
    });

    it("should handle URL with authentication", async () => {
      interface WebhookMap {
        withauth: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("withauth", async ({ req, ack }) => {
        expect(req.path).toBe("/withauth");
        return await ack({ status: 200 });
      });

      await router.handle(
        createMockRequest("https://user:pass@example.com/webhooks/withauth", {
          data: "test",
        })
      );
    });

    it("should not strip /webhooks/ if it doesn't start with it", async () => {
      interface WebhookMap {
        "api/webhooks": { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("api/webhooks", async ({ req, ack }) => {
        expect(req.path).toBe("/api/webhooks");
        return await ack({ status: 200 });
      });

      const response = await router.handle(
        createMockRequest("/webhooks/api/webhooks", { data: "test" })
      );

      // Should match since path starts with /webhooks/ and handler matches "api/webhooks"
      expect(response.status).toBe(200);
    });

    it("should handle root path", async () => {
      interface WebhookMap {
        "": { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("", async ({ req, ack }) => {
        expect(req.path).toBe("/");
        return await ack({ status: 200 });
      });

      const response = await router.handle(
        createMockRequest("/webhooks/", { data: "test" })
      );

      // Should match the root handler
      expect(response.status).toBe(200);
    });

    it("should handle /webhooks/ as root webhook path", async () => {
      interface WebhookMap {
        "": { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("", async ({ req, ack }) => {
        expect(req.path).toBe("/");
        return await ack({ status: 200 });
      });

      await router.handle(createMockRequest("/webhooks/", { data: "test" }));
    });

    it("should handle encoded URL paths", async () => {
      interface WebhookMap {
        "with spaces": { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("with spaces", async ({ req, ack }) => {
        expect(req.path).toBe("/with%20spaces");
        return await ack({ status: 200 });
      });

      await router.handle(
        createMockRequest("https://example.com/webhooks/with%20spaces", {
          data: "test",
        })
      );
    });
  });

  describe("Configurable prefix", () => {
    it("should use custom prefix when provided", async () => {
      interface WebhookMap {
        payment: { id: string };
      }

      const router = new WebhookRouter<WebhookMap>({
        prefix: "/api/hooks/",
      });

      router.register("payment", {
        handler: async ({ payload, ack }) => {
          expect(payload.id).toBe("123");
          return await ack({ body: "success", status: 200 });
        },
        schema: z.object({ id: z.string() }),
      });

      const response = await router.handle(
        createMockRequest("/api/hooks/payment", { id: "123" })
      );

      expect(response).toStrictEqual({ body: "success", status: 200 });
    });

    it("should return 404 for paths not matching custom prefix", async () => {
      interface WebhookMap {
        payment: { id: string };
      }

      const router = new WebhookRouter<WebhookMap>({
        prefix: "/api/hooks/",
      });

      router.register("payment", async ({ ack }) => await ack({ status: 200 }));

      // Wrong prefix
      const response1 = await router.handle(
        createMockRequest("/webhooks/payment", { id: "123" })
      );
      expect(response1).toStrictEqual({
        body: { error: "not found" },
        status: 404,
      });

      // No prefix
      const response2 = await router.handle(
        createMockRequest("/payment", { id: "123" })
      );
      expect(response2).toStrictEqual({
        body: { error: "not found" },
        status: 404,
      });
    });

    it("should handle custom prefix with full URLs", async () => {
      interface WebhookMap {
        event: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>({
        prefix: "/custom/",
      });

      router.register("event", async ({ req, ack }) => {
        expect(req.path).toBe("/event");
        return await ack({ status: 200 });
      });

      await router.handle(
        createMockRequest("https://example.com/custom/event", { data: "test" })
      );
    });

    it("should default to /webhooks/ prefix when not provided", async () => {
      interface WebhookMap {
        test: { id: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register(
        "test",
        async ({ ack }) => await ack({ body: "success", status: 200 })
      );

      const response = await router.handle(
        createMockRequest("/webhooks/test", { id: "123" })
      );

      expect(response).toStrictEqual({ body: "success", status: 200 });
    });

    it("should handle empty string prefix", async () => {
      interface WebhookMap {
        payment: { id: string };
      }

      const router = new WebhookRouter<WebhookMap>({
        prefix: "/",
      });

      router.register("payment", {
        handler: async ({ payload, ack }) => {
          expect(payload.id).toBe("123");
          return await ack({ body: "success", status: 200 });
        },
        schema: z.object({ id: z.string() }),
      });

      const response = await router.handle(
        createMockRequest("/payment", { id: "123" })
      );

      expect(response).toStrictEqual({ body: "success", status: 200 });
    });

    it("should handle nested paths with custom prefix", async () => {
      interface WebhookMap {
        "github/push": { ref: string };
        "stripe/events": { type: string };
      }

      const router = new WebhookRouter<WebhookMap>({
        prefix: "/api/v1/webhooks/",
      });

      router.register("stripe/events", async ({ req, ack }) => {
        expect(req.path).toBe("/stripe/events");
        return await ack({ status: 200 });
      });

      router.register("github/push", async ({ req, ack }) => {
        expect(req.path).toBe("/github/push");
        return await ack({ status: 200 });
      });

      await router.handle(
        createMockRequest("/webhooks/api/v1/webhooks/stripe/events", {
          type: "payment",
        })
      );

      await router.handle(
        createMockRequest("/webhooks/api/v1/webhooks/github/push", {
          ref: "main",
        })
      );
    });

    it("should handle custom prefix with query parameters", async () => {
      interface WebhookMap {
        notify: { message: string };
      }

      const router = new WebhookRouter<WebhookMap>({
        prefix: "/notifications/",
      });

      router.register("notify", async ({ req, ack }) => {
        expect(req.path).toBe("/notify");
        return await ack({ status: 200 });
      });

      await router.handle(
        createMockRequest(
          "/webhooks/notifications/notify?priority=high&channel=email",
          {
            message: "test",
          }
        )
      );
    });

    it("should normalize paths without a leading slash after prefix stripping", async () => {
      interface WebhookMap {
        ihello: { value: string };
      }

      const router = new WebhookRouter<WebhookMap>({
        prefix: "/api",
      });

      router.register("ihello", async ({ req, ack }) => {
        expect(req.path).toBe("ihello");
        return await ack({ body: "ok", status: 200 });
      });

      const response = await router.handle(
        createMockRequest("/apihello", { value: "test" })
      );

      expect(response).toStrictEqual({ body: "ok", status: 200 });
    });
  });
});
