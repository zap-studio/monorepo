// biome-ignore-all lint/style/noMagicNumbers: This is a test file so magic numbers are acceptable here.

import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { WebhookRouter } from "../src/index";
import type { NormalizedRequest } from "../src/types";

describe("WebhookRouter", () => {
  const createMockRequest = (
    path: string,
    body: unknown,
    method: "POST" | "GET" = "POST"
  ): NormalizedRequest => ({
    method,
    path,
    headers: new Headers(),
    rawBody: Buffer.from(JSON.stringify(body)),
  });

  describe("Basic routing", () => {
    it("should handle webhook without schema validation", async () => {
      interface WebhookMap {
        test: { id: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("test", ({ payload, ack }) => {
        expect(payload).toEqual({ id: "123" });
        return ack({ status: 200, body: "success" });
      });

      const response = await router.handle(
        createMockRequest("/webhooks/test", { id: "123" })
      );

      expect(response).toEqual({ status: 200, body: "success" });
    });

    it("should return 404 for unregistered paths", async () => {
      interface WebhookMap {
        test: { id: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      const response = await router.handle(
        createMockRequest("/webhooks/unknown", { id: "123" })
      );

      expect(response).toEqual({ status: 404, body: { error: "not found" } });
    });

    it("should return 404 for paths without /webhooks/ prefix", async () => {
      interface WebhookMap {
        test: { id: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("test", ({ ack }) =>
        ack({ status: 200, body: "success" })
      );

      const response = await router.handle(
        createMockRequest("/test", { id: "123" })
      );

      expect(response).toEqual({ status: 404, body: { error: "not found" } });
    });

    it("should handle multiple registered paths", async () => {
      interface WebhookMap {
        order: { id: string };
        payment: { amount: number };
        user: { name: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("payment", ({ payload, ack }) =>
        ack({ status: 200, body: { received: payload.amount } })
      );

      router.register("user", ({ payload, ack }) =>
        ack({
          status: 200,
          body: { greeting: `Hello ${payload.name}` },
        })
      );

      router.register("order", ({ payload, ack }) =>
        ack({ status: 200, body: { orderId: payload.id } })
      );

      const paymentResponse = await router.handle(
        createMockRequest("/webhooks/payment", { amount: 100 })
      );
      expect(paymentResponse).toEqual({
        status: 200,
        body: { received: 100 },
      });

      const userResponse = await router.handle(
        createMockRequest("/webhooks/user", { name: "Alice" })
      );
      expect(userResponse).toEqual({
        status: 200,
        body: { greeting: "Hello Alice" },
      });

      const orderResponse = await router.handle(
        createMockRequest("/webhooks/order", { id: "order_123" })
      );
      expect(orderResponse).toEqual({
        status: 200,
        body: { orderId: "order_123" },
      });
    });

    it("should handle request without explicit response", async () => {
      interface WebhookMap {
        silent: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("silent", () => ({ status: 200, body: "ok" }));

      const response = await router.handle(
        createMockRequest("/webhooks/silent", { data: "test" })
      );

      expect(response).toEqual({ status: 200, body: "ok" });
    });

    it("should preserve request metadata in handler", async () => {
      interface WebhookMap {
        metadata: { value: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("metadata", ({ req, ack }) => {
        expect(req.method).toBe("POST");
        expect(req.path).toBe("/metadata");
        expect(req.headers).toBeInstanceOf(Headers);
        expect(req.rawBody).toBeInstanceOf(Buffer);
        expect(req.json).toBeDefined();
        return ack({ status: 200 });
      });

      await router.handle(
        createMockRequest("/webhooks/metadata", { value: "test" })
      );
    });
  });

  describe("Schema validation with Zod", () => {
    it("should validate payload with Zod schema", async () => {
      interface WebhookMap {
        payment: { id: string; amount: number };
      }

      const router = new WebhookRouter<WebhookMap>();

      const paymentSchema = z.object({
        id: z.string(),
        amount: z.number().positive(),
      });

      router.register("payment", {
        schema: paymentSchema,
        handler: ({ payload, ack }) => {
          expect(payload).toEqual({ id: "pay_123", amount: 100 });
          return ack({ status: 200, body: "payment processed" });
        },
      });

      const response = await router.handle(
        createMockRequest("/webhooks/payment", { id: "pay_123", amount: 100 })
      );

      expect(response).toEqual({ status: 200, body: "payment processed" });
    });

    it("should reject invalid payload when schema is provided", async () => {
      interface WebhookMap {
        payment: { id: string; amount: number };
      }

      const router = new WebhookRouter<WebhookMap>();

      const paymentSchema = z.object({
        id: z.string(),
        amount: z.number().positive(),
      });

      router.register("payment", {
        schema: paymentSchema,
        handler: ({ ack }) => ack({ status: 200 }),
      });

      const response = await router.handle(
        createMockRequest("/webhooks/payment", { id: "pay_123", amount: -100 })
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
        id: z.string(),
        email: z.string().email(),
      });

      router.register("user", {
        schema: userSchema,
        handler: ({ ack }) => ack({ status: 200 }),
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
          items: Array<{ sku: string; quantity: number }>;
          customer: { email: string; name: string };
        };
      }

      const router = new WebhookRouter<WebhookMap>();

      const orderSchema = z.object({
        id: z.string(),
        items: z.array(
          z.object({
            sku: z.string(),
            quantity: z.number().int().positive(),
          })
        ),
        customer: z.object({
          email: z.string().email(),
          name: z.string().min(1),
        }),
      });

      router.register("order", {
        schema: orderSchema,
        handler: ({ payload, ack }) => {
          expect(payload.items).toHaveLength(2);
          expect(payload.customer.email).toBe("test@example.com");
          return ack({ status: 200 });
        },
      });

      const validOrder = {
        id: "order_123",
        items: [
          { sku: "WIDGET-1", quantity: 2 },
          { sku: "GADGET-5", quantity: 1 },
        ],
        customer: {
          email: "test@example.com",
          name: "John Doe",
        },
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
        value: z.string().transform((val) => Number.parseInt(val, 10)),
      });

      router.register("data", {
        schema,
        handler: ({ payload, ack }) => {
          expect(typeof payload.value).toBe("number");
          expect(payload.value).toBe(42);
          return ack({ status: 200 });
        },
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
          version: 1,
          vendor: "custom",
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
                    path: ["value"],
                    message: "Value must be a number between 1 and 100",
                  },
                ],
              };
            }
            return {
              value: { value: obj.value },
            };
          },
        },
      };

      router.register("custom", {
        schema: customValidator,
        handler: ({ payload, ack }) => {
          expect(payload.value).toBe(50);
          return ack({ status: 200 });
        },
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
          version: 1,
          vendor: "custom",
          validate: async (data: unknown) => {
            const obj = data as { id?: unknown };

            // Simulate async operation
            await new Promise((resolve) => setTimeout(resolve, 10));

            if (typeof obj.id !== "string" || !obj.id.startsWith("valid_")) {
              return {
                issues: [
                  {
                    path: ["id"],
                    message: "ID must start with 'valid_'",
                  },
                ],
              };
            }

            return {
              value: { id: obj.id },
            };
          },
        },
      };

      router.register("async", {
        schema: asyncValidator,
        handler: ({ payload, ack }) => {
          expect(payload.id).toBe("valid_123");
          return ack({ status: 200 });
        },
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

      router.register("secure", ({ ack }) => ack({ status: 200 }));

      await router.handle(
        createMockRequest("/webhooks/secure", { data: "test" })
      );

      expect(verifyWasCalled).toBe(true);
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
        schema,
        handler: ({ ack }) => {
          callOrder.push("handler");
          return ack({ status: 200 });
        },
      });

      await router.handle(
        createMockRequest("/webhooks/verified", { value: 42 })
      );

      expect(callOrder).toEqual(["verify", "handler"]);
    });

    it("should support async verify functions", async () => {
      interface WebhookMap {
        "async-verify": { data: string };
      }

      const router = new WebhookRouter<WebhookMap>({
        verify: async (req) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          expect(req.path).toBe("/async-verify");
        },
      });

      router.register("async-verify", ({ ack }) => ack({ status: 200 }));

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

      router.register("created", ({ ack }) =>
        ack({ status: 201, body: { created: true } })
      );

      const response = await router.handle(
        createMockRequest("/webhooks/created", { name: "test" })
      );

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ created: true });
    });

    it("should support custom headers", async () => {
      interface WebhookMap {
        headers: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      const customHeaders = new Headers();
      customHeaders.set("X-Custom-Header", "test-value");

      router.register("headers", ({ ack }) =>
        ack({
          status: 200,
          body: "ok",
          headers: customHeaders,
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

      router.register("string", ({ ack }) =>
        ack({ status: 200, body: "plain text" })
      );

      router.register("object", ({ ack }) =>
        ack({ status: 200, body: { key: "value" } })
      );

      router.register("number", ({ ack }) => ack({ status: 200, body: 42 }));

      const stringResponse = await router.handle(
        createMockRequest("/webhooks/string", { data: "test" })
      );
      expect(stringResponse.body).toBe("plain text");

      const objectResponse = await router.handle(
        createMockRequest("/webhooks/object", { data: "test" })
      );
      expect(objectResponse.body).toEqual({ key: "value" });

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

      router.register("json", ({ payload, ack }) => {
        expect(payload).toBeUndefined();
        return ack({ status: 200 });
      });

      const malformedRequest: NormalizedRequest = {
        method: "POST",
        path: "/webhooks/json",
        headers: new Headers(),
        rawBody: Buffer.from("not valid json{"),
      };

      const response = await router.handle(malformedRequest);
      expect(response.status).toBe(200);
    });

    it("should handle empty request body", async () => {
      interface WebhookMap {
        empty: { data?: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("empty", ({ payload, ack }) => {
        expect(payload).toBeUndefined();
        return ack({ status: 200 });
      });

      const emptyRequest: NormalizedRequest = {
        method: "POST",
        path: "/webhooks/empty",
        headers: new Headers(),
        rawBody: Buffer.from(""),
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

        router.register("test", ({ ack }) => {
          callOrder.push("handler");
          return ack({ status: 200 });
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(callOrder).toEqual(["before", "handler"]);
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

        router.register("test", ({ ack }) => {
          callOrder.push("handler");
          return ack({ status: 200 });
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(callOrder).toEqual([
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

        router.register("test", ({ req, ack }) => {
          expect(
            (req as { metadata?: { timestamp: number } }).metadata
          ).toBeDefined();
          expect(
            typeof (req as { metadata?: { timestamp: number } }).metadata
              ?.timestamp
          ).toBe("number");
          return ack({ status: 200 });
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
            status: 400,
            body: { error: error.message },
          }),
        });

        router.register("test", ({ ack }) => {
          handlerCalled = true;
          return ack({ status: 200 });
        });

        const response = await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(handlerCalled).toBe(false);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: "Before hook error" });
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

        router.register("test", ({ ack }) => {
          callOrder.push("handler");
          return ack({ status: 200 });
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(callOrder).toEqual(["handler", "after"]);
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

        router.register("test", ({ ack }) => {
          callOrder.push("handler");
          return ack({ status: 200 });
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(callOrder).toEqual(["handler", "after-1", "after-2", "after-3"]);
      });

      it("should receive response in after hooks", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        const router = new WebhookRouter<WebhookMap>({
          after: (_req, res) => {
            expect(res.status).toBe(201);
            expect(res.body).toEqual({ result: "success" });
          },
        });

        router.register("test", ({ ack }) =>
          ack({ status: 201, body: { result: "success" } })
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
            status: 500,
            body: { error: "Handler error" },
          }),
        });

        router.register("test", () => {
          throw new Error("Handler error");
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(afterCalled).toBe(false);
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
            return { status: 500, body: { error: error.message } };
          },
        });

        router.register("test", () => {
          throw new Error("Test error");
        });

        const response = await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(errorHookCalled).toBe(true);
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Test error" });
      });

      it("should execute onError hook when verify throws", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        let errorHookCalled = false;

        const router = new WebhookRouter<WebhookMap>({
          verify: () => {
            throw new Error("Verification failed");
          },
          onError: (error) => {
            errorHookCalled = true;
            expect(error.message).toBe("Verification failed");
            return { status: 401, body: { error: "Unauthorized" } };
          },
        });

        router.register("test", ({ ack }) => ack({ status: 200 }));

        const response = await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(errorHookCalled).toBe(true);
        expect(response.status).toBe(401);
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
            return { status: 400, body: { error: error.message } };
          },
        });

        router.register("test", ({ ack }) => ack({ status: 200 }));

        const response = await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(errorHookCalled).toBe(true);
        expect(response.status).toBe(400);
      });

      it("should use default error response if onError returns undefined", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        const router = new WebhookRouter<WebhookMap>({
          onError: () => ({ status: 500, body: { error: "Custom error" } }),
        });

        router.register("test", () => {
          throw new Error("Custom error");
        });

        const response = await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Custom error" });
      });

      it("should handle different error types", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        const router = new WebhookRouter<WebhookMap>({
          onError: (error) => {
            if (error.message === "Rate limit exceeded") {
              return { status: 429, body: { error: "Too many requests" } };
            }
            if (error.message === "Unauthorized") {
              return { status: 403, body: { error: "Forbidden" } };
            }
            return { status: 500, body: { error: "Internal error" } };
          },
        });

        router.register("test", () => {
          throw new Error("Rate limit exceeded");
        });

        const response = await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(response.status).toBe(429);
        expect(response.body).toEqual({ error: "Too many requests" });
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
          handler: ({ ack }) => {
            callOrder.push("handler");
            return ack({ status: 200 });
          },
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(callOrder).toEqual(["global-before", "route-before", "handler"]);
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
          handler: ({ ack }) => {
            callOrder.push("handler");
            return ack({ status: 200 });
          },
          after: () => {
            callOrder.push("route-after");
          },
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(callOrder).toEqual(["handler", "route-after", "global-after"]);
      });

      it("should support multiple route-level hooks", async () => {
        interface WebhookMap {
          test: { value: string };
        }

        const callOrder: string[] = [];

        const router = new WebhookRouter<WebhookMap>();

        router.register("test", {
          before: [
            () => {
              callOrder.push("route-before-1");
            },
            () => {
              callOrder.push("route-before-2");
            },
          ],
          handler: ({ ack }) => {
            callOrder.push("handler");
            return ack({ status: 200 });
          },
          after: [
            () => {
              callOrder.push("route-after-1");
            },
            () => {
              callOrder.push("route-after-2");
            },
          ],
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(callOrder).toEqual([
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
          before: () => {
            callOrder.push("single-before");
          },
          handler: ({ ack }) => ack({ status: 200 }),
          after: () => {
            callOrder.push("single-after");
          },
        });

        router.register("array", {
          before: [
            () => {
              callOrder.push("array-before-1");
            },
            () => {
              callOrder.push("array-before-2");
            },
          ],
          handler: ({ ack }) => ack({ status: 200 }),
          after: [
            () => {
              callOrder.push("array-after-1");
            },
            () => {
              callOrder.push("array-after-2");
            },
          ],
        });

        await router.handle(
          createMockRequest("/webhooks/single", { value: "test" })
        );
        await router.handle(
          createMockRequest("/webhooks/array", { value: "test" })
        );

        expect(callOrder).toEqual([
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
          after: [
            () => {
              callOrder.push("global-after-1");
            },
            () => {
              callOrder.push("global-after-2");
            },
          ],
        });

        const schema = z.object({ value: z.string() });

        router.register("test", {
          before: [
            () => {
              callOrder.push("route-before-1");
            },
            () => {
              callOrder.push("route-before-2");
            },
          ],
          schema,
          handler: ({ ack }) => {
            callOrder.push("handler");
            return ack({ status: 200 });
          },
          after: [
            () => {
              callOrder.push("route-after-1");
            },
            () => {
              callOrder.push("route-after-2");
            },
          ],
        });

        await router.handle(
          createMockRequest("/webhooks/test", { value: "test" })
        );

        expect(callOrder).toEqual([
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

      router.register("fullurl", ({ ack }) => ack({ status: 200, body: "ok" }));

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

      router.register("query", ({ ack }) =>
        ack({ status: 200, body: "query received" })
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

      router.register("known", ({ ack }) =>
        ack({ status: 200, body: "known route" })
      );

      const response = await router.handle(
        createMockRequest("https://example.com/webhooks/unknown", {
          data: "test",
        })
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "not found" });
    });

    it("should preserve full URL in request metadata", async () => {
      interface WebhookMap {
        metadata: { value: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("metadata", ({ req, ack }) => {
        expect(req.path).toBe("/metadata");
        return ack({ status: 200 });
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

      router.register("simple", ({ req, ack }) => {
        expect(req.path).toBe("/simple");
        return ack({ status: 200 });
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

      router.register("noslash", ({ req, ack }) => {
        expect(req.path).toBe("noslash");
        return ack({ status: 200 });
      });

      await router.handle(createMockRequest("noslash", { data: "test" }));
    });

    it("should extract pathname from full URL", async () => {
      interface WebhookMap {
        extracted: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("extracted", ({ req, ack }) => {
        expect(req.path).toBe("/extracted");
        return ack({ status: 200 });
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

      router.register("stripped", ({ req, ack }) => {
        expect(req.path).toBe("/stripped");
        return ack({ status: 200 });
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

      router.register("fullstrip", ({ req, ack }) => {
        expect(req.path).toBe("/fullstrip");
        return ack({ status: 200 });
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

      router.register("api/webhooks/event", ({ req, ack }) => {
        expect(req.path).toBe("/api/webhooks/event");
        return ack({ status: 200 });
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

      router.register("withquery", ({ req, ack }) => {
        expect(req.path).toBe("/withquery");
        return ack({ status: 200 });
      });

      await router.handle(
        createMockRequest(
          "https://example.com/webhooks/withquery?foo=bar&baz=qux",
          { data: "test" }
        )
      );
    });

    it("should handle URL with hash fragment", async () => {
      interface WebhookMap {
        withhash: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("withhash", ({ req, ack }) => {
        expect(req.path).toBe("/withhash");
        return ack({ status: 200 });
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

      router.register("api/v1/events", ({ req, ack }) => {
        expect(req.path).toBe("/api/v1/events");
        return ack({ status: 200 });
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

      router.register("withport", ({ req, ack }) => {
        expect(req.path).toBe("/withport");
        return ack({ status: 200 });
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

      router.register("withauth", ({ req, ack }) => {
        expect(req.path).toBe("/withauth");
        return ack({ status: 200 });
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

      router.register("api/webhooks", ({ req, ack }) => {
        expect(req.path).toBe("/api/webhooks");
        return ack({ status: 200 });
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

      router.register("", ({ req, ack }) => {
        expect(req.path).toBe("/");
        return ack({ status: 200 });
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

      router.register("", ({ req, ack }) => {
        expect(req.path).toBe("/");
        return ack({ status: 200 });
      });

      await router.handle(createMockRequest("/webhooks/", { data: "test" }));
    });

    it("should handle encoded URL paths", async () => {
      interface WebhookMap {
        "with spaces": { data: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("with spaces", ({ req, ack }) => {
        expect(req.path).toBe("/with%20spaces");
        return ack({ status: 200 });
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

      router.register("payment", ({ payload, ack }) => {
        expect(payload.id).toBe("123");
        return ack({ status: 200, body: "success" });
      });

      const response = await router.handle(
        createMockRequest("/api/hooks/payment", { id: "123" })
      );

      expect(response).toEqual({ status: 200, body: "success" });
    });

    it("should return 404 for paths not matching custom prefix", async () => {
      interface WebhookMap {
        payment: { id: string };
      }

      const router = new WebhookRouter<WebhookMap>({
        prefix: "/api/hooks/",
      });

      router.register("payment", ({ ack }) => ack({ status: 200 }));

      // Wrong prefix
      const response1 = await router.handle(
        createMockRequest("/webhooks/payment", { id: "123" })
      );
      expect(response1).toEqual({ status: 404, body: { error: "not found" } });

      // No prefix
      const response2 = await router.handle(
        createMockRequest("/payment", { id: "123" })
      );
      expect(response2).toEqual({ status: 404, body: { error: "not found" } });
    });

    it("should handle custom prefix with full URLs", async () => {
      interface WebhookMap {
        event: { data: string };
      }

      const router = new WebhookRouter<WebhookMap>({
        prefix: "/custom/",
      });

      router.register("event", ({ req, ack }) => {
        expect(req.path).toBe("/event");
        return ack({ status: 200 });
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

      router.register("test", ({ ack }) =>
        ack({ status: 200, body: "success" })
      );

      const response = await router.handle(
        createMockRequest("/webhooks/test", { id: "123" })
      );

      expect(response).toEqual({ status: 200, body: "success" });
    });

    it("should handle empty string prefix", async () => {
      interface WebhookMap {
        payment: { id: string };
      }

      const router = new WebhookRouter<WebhookMap>({
        prefix: "/",
      });

      router.register("payment", ({ payload, ack }) => {
        expect(payload.id).toBe("123");
        return ack({ status: 200, body: "success" });
      });

      const response = await router.handle(
        createMockRequest("/payment", { id: "123" })
      );

      expect(response).toEqual({ status: 200, body: "success" });
    });

    it("should handle nested paths with custom prefix", async () => {
      interface WebhookMap {
        "github/push": { ref: string };
        "stripe/events": { type: string };
      }

      const router = new WebhookRouter<WebhookMap>({
        prefix: "/api/v1/webhooks/",
      });

      router.register("stripe/events", ({ req, ack }) => {
        expect(req.path).toBe("/stripe/events");
        return ack({ status: 200 });
      });

      router.register("github/push", ({ req, ack }) => {
        expect(req.path).toBe("/github/push");
        return ack({ status: 200 });
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

      router.register("notify", ({ req, ack }) => {
        expect(req.path).toBe("/notify");
        return ack({ status: 200 });
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
  });
});
