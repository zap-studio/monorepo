import type { Logger } from "@zap-studio/logger";
import type { StandardSchemaV1 } from "@zap-studio/validation";

import { describe, expect, it } from "vitest";
import { z } from "zod";

import { VerificationError } from "./errors.ts";
import { createWebhookRouter, WebhookRouter } from "./index.ts";
import { createHmacVerifier } from "./verify.ts";

const PAYMENT_WEBHOOK_PATH = "/webhooks/payment";
const TEST_WEBHOOK_PATH = "/webhooks/test";
const UNKNOWN_WEBHOOK_PATH = "/webhooks/unknown";
const STRIPE_WEBHOOK_PATH = "/webhooks/stripe";
const SIGNATURE_HEADER_NAME = "x-signature";
const SHOULD_NOT_RUN_MESSAGE = "should not run";
const GLOBAL_BEFORE_STEP = "global-before";
const ROUTE_BEFORE_STEP = "route-before";
const GLOBAL_AFTER_STEP = "global-after";
const ROUTE_AFTER_STEP = "route-after";
const REQUEST_BASE_URL = "https://example.com";

const createRecordingLogger = (): Logger & {
  calls: {
    level: string;
    message: string;
    context: Record<string, unknown> | undefined;
  }[];
} => {
  const calls: {
    level: string;
    message: string;
    context: Record<string, unknown> | undefined;
  }[] = [];
  const record =
    (level: string) =>
    (message: string, context?: Record<string, unknown>): void => {
      calls.push({ context, level, message });
    };

  return {
    calls,
    debug: record("debug"),
    error: record("error"),
    fatal: record("fatal"),
    info: record("info"),
    trace: record("trace"),
    warn: record("warn"),
  };
};

describe("WebhookRouter", () => {
  const encoder = new TextEncoder();

  const createRequest = (
    path: string,
    body?: unknown,
    init?: { headers?: HeadersInit; method?: string },
  ): Request => {
    const requestInit: RequestInit = {
      body: body === undefined ? null : JSON.stringify(body),
      method: init?.method ?? "POST",
    };
    if (init?.headers !== undefined) {
      requestInit.headers = init.headers;
    }
    return new Request(new URL(path, REQUEST_BASE_URL), requestInit);
  };

  describe("Basic routing", () => {
    it("should support schema-first route registration at creation time", async () => {
      const router = createWebhookRouter();
      router.register("/payment", {
        handler: ({ payload }) => Response.json(payload.amount),
        schema: z.object({
          amount: z.number(),
        }),
      });

      const response = await router.handle(createRequest(PAYMENT_WEBHOOK_PATH, { amount: 100 }));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toBe(100);
    });

    it("should handle webhook without schema validation", async () => {
      interface WebhookMap {
        "/test": { id: string };
      }

      const router = new WebhookRouter<WebhookMap>();

      router.register("/test", ({ payload }) => {
        expect(payload).toStrictEqual({ id: "123" });
        return Response.json("success");
      });

      const response = await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "123" }));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toBe("success");
    });

    it("should return 404 for unregistered paths", async () => {
      const router = createWebhookRouter();

      const response = await router.handle(createRequest(UNKNOWN_WEBHOOK_PATH, { id: "123" }));

      expect(response.status).toBe(404);
      await expect(response.json()).resolves.toStrictEqual({
        error: "not found",
      });
    });

    it("should return 404 for paths without /webhooks prefix", async () => {
      const router = createWebhookRouter();

      router.register("/test", () => Response.json("success"));

      const response = await router.handle(createRequest("/test", { id: "123" }));

      expect(response.status).toBe(404);
      await expect(response.json()).resolves.toStrictEqual({
        error: "not found",
      });
    });

    it("should not read the request body when the route is unknown", async () => {
      const router = createWebhookRouter();
      const request = createRequest(UNKNOWN_WEBHOOK_PATH, { id: "123" });

      const response = await router.handle(request);

      expect(response.status).toBe(404);
      expect(request.bodyUsed).toBe(false);
    });

    it("should handle multiple registered paths", async () => {
      const router = createWebhookRouter();

      router.register("/payment", {
        handler: ({ payload }) => Response.json({ received: payload.amount }),
        schema: z.object({ amount: z.number() }),
      });

      router.register("/user", {
        handler: ({ payload }) => Response.json({ hello: payload.name }),
        schema: z.object({ name: z.string() }),
      });

      const paymentResponse = await router.handle(
        createRequest(PAYMENT_WEBHOOK_PATH, { amount: 42 }),
      );
      const userResponse = await router.handle(createRequest("/webhooks/user", { name: "ada" }));

      await expect(paymentResponse.json()).resolves.toStrictEqual({
        received: 42,
      });
      await expect(userResponse.json()).resolves.toStrictEqual({
        hello: "ada",
      });
    });

    it("should return default response when handler returns undefined", async () => {
      const router = createWebhookRouter();

      router.register("/test", () => undefined);

      const response = await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "123" }));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toBe("ok");
    });

    it("should expose request metadata and raw body in handler context", async () => {
      const router = createWebhookRouter();

      const observed: {
        method: string;
        path: string;
        rawBody: Uint8Array;
        signature: string | null;
      }[] = [];

      router.register("/meta", ({ request, rawBody, path }) => {
        observed.push({
          method: request.method,
          path,
          rawBody,
          signature: request.headers.get(SIGNATURE_HEADER_NAME),
        });
        return undefined;
      });

      const body = { id: "123" };
      await router.handle(
        createRequest("/webhooks/meta", body, {
          headers: { [SIGNATURE_HEADER_NAME]: "sig" },
        }),
      );

      expect(observed).toHaveLength(1);
      const [entry] = observed;
      expect(entry?.method).toBe("POST");
      expect(entry?.path).toBe("/meta");
      expect(entry?.signature).toBe("sig");
      expect(entry?.rawBody).toStrictEqual(encoder.encode(JSON.stringify(body)));
    });
  });

  describe("Schema validation with Zod", () => {
    it("should validate payload with Zod schema", async () => {
      const router = createWebhookRouter();

      router.register("/payment", {
        handler: ({ payload }) => Response.json(payload),
        schema: z.object({
          amount: z.number(),
          currency: z.string(),
        }),
      });

      const response = await router.handle(
        createRequest(PAYMENT_WEBHOOK_PATH, { amount: 10, currency: "usd" }),
      );

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toStrictEqual({
        amount: 10,
        currency: "usd",
      });
    });

    it("should reject invalid payload when schema is provided", async () => {
      const router = createWebhookRouter();

      router.register("/payment", {
        handler: () => Response.json(SHOULD_NOT_RUN_MESSAGE),
        schema: z.object({ amount: z.number() }),
      });

      const response = await router.handle(
        createRequest(PAYMENT_WEBHOOK_PATH, { amount: "not a number" }),
      );

      expect(response.status).toBe(400);
      // SAFETY: the schema above requires `amount` and the route handler responds with the
      // router's standard { error, issues } validation-failure JSON body on rejection, matching
      // this shape.
      const body = (await response.json()) as {
        error: string;
        issues: { message: string; path?: string[] }[];
      };
      expect(body.error).toBe("validation failed");
      expect(body.issues.length).toBeGreaterThan(0);
      expect(body.issues[0]?.path).toStrictEqual(["amount"]);
    });

    it("should reject payload with missing required fields", async () => {
      const router = createWebhookRouter();

      router.register("/payment", {
        handler: () => Response.json(SHOULD_NOT_RUN_MESSAGE),
        schema: z.object({
          amount: z.number(),
          currency: z.string(),
        }),
      });

      const response = await router.handle(createRequest(PAYMENT_WEBHOOK_PATH, { amount: 10 }));

      expect(response.status).toBe(400);
      // SAFETY: the schema above rejects a payload missing `currency`, so the router responds
      // with its standard { error, issues } validation-failure JSON body, which includes `error`.
      const body = (await response.json()) as { error: string };
      expect(body.error).toBe("validation failed");
    });

    it("should validate complex nested schemas", async () => {
      const router = createWebhookRouter();

      router.register("/order", {
        handler: ({ payload }) => Response.json(payload.items.length),
        schema: z.object({
          customer: z.object({
            email: z.string(),
            name: z.string(),
          }),
          items: z.array(
            z.object({
              price: z.number(),
              quantity: z.number(),
              sku: z.string(),
            }),
          ),
        }),
      });

      const response = await router.handle(
        createRequest("/webhooks/order", {
          customer: { email: "a@b.c", name: "Ada" },
          items: [
            { price: 10, quantity: 2, sku: "sku-1" },
            { price: 5, quantity: 1, sku: "sku-2" },
          ],
        }),
      );

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toBe(2);
    });

    it("should transform data with Zod transforms", async () => {
      const router = createWebhookRouter();

      router.register("/transform", {
        handler: ({ payload }) => Response.json(payload),
        schema: z.object({
          value: z.string().transform((v) => v.toUpperCase()),
        }),
      });

      const response = await router.handle(
        createRequest("/webhooks/transform", { value: "hello" }),
      );

      await expect(response.json()).resolves.toStrictEqual({
        value: "HELLO",
      });
    });
  });

  describe("Custom schema validator", () => {
    const createCustomSchema = <T>(
      validate: (value: unknown) => StandardSchemaV1.Result<T>,
    ): StandardSchemaV1<unknown, T> => ({
      "~standard": {
        validate,
        vendor: "test",
        version: 1,
      },
    });

    it("should work with custom Standard Schema validator", async () => {
      const schema = createCustomSchema<{ id: string }>((value) => {
        if (
          typeof value === "object" &&
          value !== null &&
          "id" in value &&
          typeof value.id === "string"
        ) {
          return { value: { id: value.id } };
        }
        return { issues: [{ message: "id must be a string" }] };
      });

      const router = createWebhookRouter();
      router.register("/custom", {
        handler: ({ payload }) => Response.json(payload.id),
        schema,
      });

      const okResponse = await router.handle(createRequest("/webhooks/custom", { id: "abc" }));
      await expect(okResponse.json()).resolves.toBe("abc");

      const badResponse = await router.handle(createRequest("/webhooks/custom", { id: 1 }));
      expect(badResponse.status).toBe(400);
    });

    it("should support async validators", async () => {
      const schema = createCustomSchema<{ id: string }>((value) => {
        if (
          typeof value === "object" &&
          value !== null &&
          "id" in value &&
          typeof value.id === "string"
        ) {
          return { value: { id: value.id } };
        }
        return { issues: [{ message: "invalid" }] };
      });

      const asyncSchema: StandardSchemaV1<unknown, { id: string }> = {
        "~standard": {
          validate: (value) => Promise.resolve(schema["~standard"].validate(value)),
          vendor: "test",
          version: 1,
        },
      };

      const router = createWebhookRouter();
      router.register("/async", {
        handler: ({ payload }) => Response.json(payload.id),
        schema: asyncSchema,
      });

      const response = await router.handle(createRequest("/webhooks/async", { id: "async-id" }));

      await expect(response.json()).resolves.toBe("async-id");
    });

    it("should map object path segments from schema issues", async () => {
      const schema = createCustomSchema<never>(() => ({
        issues: [
          {
            message: "bad key",
            path: [{ key: "nested" }, { key: "field" }],
          },
        ],
      }));

      const router = createWebhookRouter();
      router.register("/paths", {
        handler: () => Response.json(SHOULD_NOT_RUN_MESSAGE),
        schema,
      });

      const response = await router.handle(
        createRequest("/webhooks/paths", { nested: { field: 1 } }),
      );

      expect(response.status).toBe(400);
      // SAFETY: the custom schema above always fails with an `issues` array containing a "nested"
      // path entry, so the router's standard validation-failure JSON body has this shape.
      const body = (await response.json()) as {
        issues: { message: string; path?: string[] }[];
      };
      expect(body.issues[0]?.path).toStrictEqual(["nested", "field"]);
    });
  });

  describe("Request verification", () => {
    it("should work with custom verify function", async () => {
      const router = createWebhookRouter({
        verify: (ctx) => {
          if (ctx.request.headers.get("x-api-key") !== "secret") {
            throw new Error("Unauthorized");
          }
        },
      });

      router.register("/secure", () => Response.json("verified"));

      const okResponse = await router.handle(
        createRequest("/webhooks/secure", { id: "1" }, { headers: { "x-api-key": "secret" } }),
      );
      await expect(okResponse.json()).resolves.toBe("verified");

      const badResponse = await router.handle(createRequest("/webhooks/secure", { id: "1" }));
      expect(badResponse.status).toBe(500);
      await expect(badResponse.json()).resolves.toStrictEqual({
        error: "Unauthorized",
      });
    });

    it("should run verify before schema validation", async () => {
      const order: string[] = [];

      const schema: StandardSchemaV1<unknown, { id: string }> = {
        "~standard": {
          validate: (value) => {
            order.push("validate");
            // SAFETY: this test always calls the router with { id: "1" } (see
            // router.handle(createRequest("/webhooks/ordered", { id: "1" })) below), so `value`
            // is always an object matching { id: string } here.
            return { value: value as { id: string } };
          },
          vendor: "test",
          version: 1,
        },
      };

      const router = createWebhookRouter({
        verify: () => {
          order.push("verify");
        },
      });

      router.register("/ordered", {
        handler: () => {
          order.push("handler");
          return undefined;
        },
        schema,
      });

      await router.handle(createRequest("/webhooks/ordered", { id: "1" }));

      expect(order).toStrictEqual(["verify", "validate", "handler"]);
    });

    it("should support async verify functions", async () => {
      const router = createWebhookRouter({
        verify: async (ctx) => {
          await Promise.resolve();
          if (ctx.rawBody.length === 0) {
            throw new Error("empty body");
          }
        },
      });

      router.register("/async-verify", () => Response.json("ok"));

      const response = await router.handle(createRequest("/webhooks/async-verify", { id: "1" }));

      expect(response.status).toBe(200);
    });
  });

  describe("Response handling", () => {
    it("should support custom status codes", async () => {
      const router = createWebhookRouter();

      router.register("/accepted", () => Response.json({ queued: true }, { status: 202 }));

      const response = await router.handle(createRequest("/webhooks/accepted", { id: "1" }));

      expect(response.status).toBe(202);
      await expect(response.json()).resolves.toStrictEqual({ queued: true });
    });

    it("should support custom headers", async () => {
      const router = createWebhookRouter();

      router.register("/headers", () =>
        Response.json("ok", {
          headers: { "x-custom": "value" },
        }),
      );

      const response = await router.handle(createRequest("/webhooks/headers", { id: "1" }));

      expect(response.headers.get("x-custom")).toBe("value");
    });

    it("should handle different body types", async () => {
      const router = createWebhookRouter();

      router.register("/text", () => new Response("plain text"));
      router.register("/json", () => Response.json({ a: 1 }));
      router.register("/empty", () => new Response(null, { status: 204 }));

      const textResponse = await router.handle(createRequest("/webhooks/text", {}));
      await expect(textResponse.text()).resolves.toBe("plain text");

      const jsonResponse = await router.handle(createRequest("/webhooks/json", {}));
      await expect(jsonResponse.json()).resolves.toStrictEqual({ a: 1 });

      const emptyResponse = await router.handle(createRequest("/webhooks/empty", {}));
      expect(emptyResponse.status).toBe(204);
      expect(emptyResponse.body).toBeNull();
    });
  });

  describe("Error handling", () => {
    it("should handle malformed JSON gracefully", async () => {
      const router = createWebhookRouter();

      router.register("/raw", ({ payload }) => {
        expect(payload).toBeUndefined();
        return Response.json("handled");
      });

      const response = await router.handle(
        new Request("https://example.com/webhooks/raw", {
          body: "not json {",
          method: "POST",
        }),
      );

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toBe("handled");
    });

    it("should reject malformed JSON when a schema is provided", async () => {
      const router = createWebhookRouter();

      router.register("/strict", {
        handler: () => Response.json(SHOULD_NOT_RUN_MESSAGE),
        schema: z.object({ id: z.string() }),
      });

      const response = await router.handle(
        new Request("https://example.com/webhooks/strict", {
          body: "not json {",
          method: "POST",
        }),
      );

      expect(response.status).toBe(400);
    });

    it("should handle empty request body", async () => {
      const router = createWebhookRouter();

      router.register("/empty", ({ payload, rawBody }) => {
        expect(payload).toBeUndefined();
        expect(rawBody).toStrictEqual(new Uint8Array(0));
        return Response.json("handled empty");
      });

      const response = await router.handle(
        new Request("https://example.com/webhooks/empty", { method: "POST" }),
      );

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toBe("handled empty");
    });
  });

  describe("Lifecycle hooks", () => {
    describe("Global before hooks", () => {
      it("should execute before hooks before handler", async () => {
        const order: string[] = [];

        const router = createWebhookRouter({
          before: () => {
            order.push("before");
          },
        });

        router.register("/test", () => {
          order.push("handler");
          return undefined;
        });

        await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

        expect(order).toStrictEqual(["before", "handler"]);
      });

      it("should execute multiple before hooks in order", async () => {
        const order: string[] = [];

        const router = createWebhookRouter({
          before: [
            () => {
              order.push("first");
            },
            () => {
              order.push("second");
            },
          ],
        });

        router.register("/test", () => {
          order.push("handler");
          return undefined;
        });

        await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

        expect(order).toStrictEqual(["first", "second", "handler"]);
      });

      it("should give before hooks access to the webhook context", async () => {
        let observedPath: string | null = null;
        let observedBytes = -1;

        const router = createWebhookRouter({
          before: (ctx) => {
            observedPath = ctx.path;
            observedBytes = ctx.rawBody.length;
          },
        });

        router.register("/ctx", () => undefined);

        await router.handle(createRequest("/webhooks/ctx", { id: "1" }));

        expect(observedPath).toBe("/ctx");
        expect(observedBytes).toBeGreaterThan(0);
      });

      it("should stop execution if before hook throws", async () => {
        let handlerRan = false;

        const router = createWebhookRouter({
          before: () => {
            throw new Error("before failed");
          },
        });

        router.register("/test", () => {
          handlerRan = true;
          return undefined;
        });

        const response = await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

        expect(handlerRan).toBe(false);
        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toStrictEqual({
          error: "before failed",
        });
      });
    });

    describe("Global after hooks", () => {
      it("should execute after hooks after handler", async () => {
        const order: string[] = [];

        const router = createWebhookRouter({
          after: () => {
            order.push("after");
          },
        });

        router.register("/test", () => {
          order.push("handler");
          return undefined;
        });

        await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

        expect(order).toStrictEqual(["handler", "after"]);
      });

      it("should execute multiple after hooks in order", async () => {
        const order: string[] = [];

        const router = createWebhookRouter({
          after: [
            () => {
              order.push("first");
            },
            () => {
              order.push("second");
            },
          ],
        });

        router.register("/test", () => undefined);

        await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

        expect(order).toStrictEqual(["first", "second"]);
      });

      it("should receive response in after hooks", async () => {
        let observedStatus = -1;
        let observedBody: { done: boolean } | null = null;

        const router = createWebhookRouter({
          after: async (_ctx, response) => {
            observedStatus = response.status;
            observedBody = await response.clone().json();
          },
        });

        router.register("/test", () => Response.json({ done: true }, { status: 201 }));

        const response = await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

        expect(observedStatus).toBe(201);
        expect(observedBody).toStrictEqual({ done: true });
        // The client response body must remain readable after the hook.
        await expect(response.json()).resolves.toStrictEqual({ done: true });
      });

      it("should not execute after hooks if handler throws", async () => {
        let afterRan = false;

        const router = createWebhookRouter({
          after: () => {
            afterRan = true;
          },
        });

        router.register("/test", () => {
          throw new Error("handler failed");
        });

        const response = await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

        expect(afterRan).toBe(false);
        expect(response.status).toBe(500);
      });
    });

    describe("Global onError hook", () => {
      it("should execute onError hook when handler throws", async () => {
        const router = createWebhookRouter({
          onError: (error) => Response.json({ custom: error.message }, { status: 503 }),
        });

        router.register("/test", () => {
          throw new Error("boom");
        });

        const response = await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

        expect(response.status).toBe(503);
        await expect(response.json()).resolves.toStrictEqual({
          custom: "boom",
        });
      });

      it("should execute onError hook when verify throws", async () => {
        let observedMessage: string | null = null;

        const router = createWebhookRouter({
          onError: (error) => {
            observedMessage = error.message;
            return Response.json({ error: "denied" }, { status: 401 });
          },
          verify: () => {
            throw new Error("bad signature");
          },
        });

        router.register("/test", () => undefined);

        const response = await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

        expect(observedMessage).toBe("bad signature");
        expect(response.status).toBe(401);
      });

      it("should expose VerificationError to onError when hmac verification fails", async () => {
        let observedError: Error | null = null;

        const router = createWebhookRouter({
          onError: (error) => {
            observedError = error;
            return undefined;
          },
          verify: createHmacVerifier({
            headerName: SIGNATURE_HEADER_NAME,
            secret: "secret",
          }),
        });

        router.register("/test", () => undefined);

        const response = await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

        expect(observedError).toBeInstanceOf(VerificationError);
        expect(response.status).toBe(500);
      });

      it("should execute onError hook when before hook throws", async () => {
        const router = createWebhookRouter({
          before: () => {
            throw new Error("before broke");
          },
          onError: (error) => Response.json({ from: "onError", message: error.message }),
        });

        router.register("/test", () => undefined);

        const response = await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

        await expect(response.json()).resolves.toStrictEqual({
          from: "onError",
          message: "before broke",
        });
      });

      it("should use default error response if onError returns undefined", async () => {
        const router = createWebhookRouter({
          onError: () => undefined,
        });

        router.register("/test", () => {
          throw new Error("boom");
        });

        const response = await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toStrictEqual({
          error: "boom",
        });
      });

      it("should return internal server error when a non-Error is thrown", async () => {
        const router = createWebhookRouter();

        router.register("/test", () => {
          throw "string error";
        });

        const response = await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toStrictEqual({
          error: "Internal server error",
        });
      });

      it("should normalize a non-Error into an Error before calling onError", async () => {
        let observedError: Error | null = null;

        const router = createWebhookRouter({
          onError: (error) => {
            observedError = error;
            return undefined;
          },
        });

        router.register("/test", () => {
          throw { reason: "object" };
        });

        await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

        expect(observedError).toBeInstanceOf(Error);
        if (observedError instanceof Error) {
          expect(observedError.message).toBe("Internal server error");
        }
      });

      it("should handle different error types", async () => {
        const router = createWebhookRouter();

        router.register("/type-error", () => {
          throw new TypeError("type issue");
        });
        router.register("/range-error", () => {
          throw new RangeError("range issue");
        });

        const typeResponse = await router.handle(createRequest("/webhooks/type-error", {}));
        await expect(typeResponse.json()).resolves.toStrictEqual({
          error: "type issue",
        });

        const rangeResponse = await router.handle(createRequest("/webhooks/range-error", {}));
        await expect(rangeResponse.json()).resolves.toStrictEqual({
          error: "range issue",
        });
      });
    });

    describe("Route-level hooks", () => {
      it("should execute route-level before hooks after global before hooks", async () => {
        const order: string[] = [];

        const router = createWebhookRouter({
          before: () => {
            order.push(GLOBAL_BEFORE_STEP);
          },
        });

        router.register("/test", {
          before: () => {
            order.push(ROUTE_BEFORE_STEP);
          },
          handler: () => {
            order.push("handler");
            return undefined;
          },
        });

        await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

        expect(order).toStrictEqual([GLOBAL_BEFORE_STEP, ROUTE_BEFORE_STEP, "handler"]);
      });

      it("should execute route-level after hooks before global after hooks", async () => {
        const order: string[] = [];

        const router = createWebhookRouter({
          after: () => {
            order.push(GLOBAL_AFTER_STEP);
          },
        });

        router.register("/test", {
          after: () => {
            order.push(ROUTE_AFTER_STEP);
          },
          handler: () => {
            order.push("handler");
            return undefined;
          },
        });

        await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

        expect(order).toStrictEqual(["handler", ROUTE_AFTER_STEP, GLOBAL_AFTER_STEP]);
      });

      it("should support multiple route-level hooks", async () => {
        const order: string[] = [];

        const router = createWebhookRouter();

        router.register("/test", {
          after: [
            () => {
              order.push("after-1");
            },
            () => {
              order.push("after-2");
            },
          ],
          before: [
            () => {
              order.push("before-1");
            },
            () => {
              order.push("before-2");
            },
          ],
          handler: () => {
            order.push("handler");
            return undefined;
          },
        });

        await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

        expect(order).toStrictEqual(["before-1", "before-2", "handler", "after-1", "after-2"]);
      });

      it("should handle single hook or array of hooks", async () => {
        const order: string[] = [];

        const router = createWebhookRouter();

        router.register("/single", {
          after: () => {
            order.push("single-after");
          },
          before: () => {
            order.push("single-before");
          },
          handler: () => undefined,
        });

        await router.handle(createRequest("/webhooks/single", { id: "1" }));

        expect(order).toStrictEqual(["single-before", "single-after"]);
      });
    });

    describe("Complete hook execution order", () => {
      it("should execute all hooks in correct order", async () => {
        const order: string[] = [];

        const schema: StandardSchemaV1<unknown, { id: string }> = {
          "~standard": {
            validate: (value) => {
              order.push("validate");
              // SAFETY: this test always calls the router with { id: "1" } (see
              // router.handle(createRequest("/webhooks/full", { id: "1" })) below), so `value`
              // is always an object matching { id: string } here.
              return { value: value as { id: string } };
            },
            vendor: "test",
            version: 1,
          },
        };

        const router = createWebhookRouter({
          after: () => {
            order.push(GLOBAL_AFTER_STEP);
          },
          before: () => {
            order.push(GLOBAL_BEFORE_STEP);
          },
          verify: () => {
            order.push("verify");
          },
        });

        router.register("/full", {
          after: () => {
            order.push(ROUTE_AFTER_STEP);
          },
          before: () => {
            order.push(ROUTE_BEFORE_STEP);
          },
          handler: () => {
            order.push("handler");
            return undefined;
          },
          schema,
        });

        await router.handle(createRequest("/webhooks/full", { id: "1" }));

        expect(order).toStrictEqual([
          GLOBAL_BEFORE_STEP,
          ROUTE_BEFORE_STEP,
          "verify",
          "validate",
          "handler",
          ROUTE_AFTER_STEP,
          GLOBAL_AFTER_STEP,
        ]);
      });
    });
  });

  describe("Path matching", () => {
    it("should route requests with query parameters", async () => {
      const router = createWebhookRouter();

      router.register("/query", () => Response.json("query received"));

      const response = await router.handle(
        createRequest("/webhooks/query?param=value&other=1", {}),
      );

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toBe("query received");
    });

    it("should route requests with port numbers in the URL", async () => {
      const router = createWebhookRouter();

      router.register("/withport", () => Response.json("ok"));

      const response = await router.handle(
        new Request("https://example.com:8080/webhooks/withport", {
          body: "{}",
          method: "POST",
        }),
      );

      expect(response.status).toBe(200);
    });

    it("should match nested paths after the prefix", async () => {
      const router = createWebhookRouter();

      router.register("/api/v1/events", () => Response.json("nested"));

      const response = await router.handle(createRequest("/webhooks/api/v1/events", {}));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toBe("nested");
    });

    it("should match paths with /webhooks/ in the middle", async () => {
      const router = createWebhookRouter();

      router.register("/api/webhooks/event", () => Response.json("middle"));

      const response = await router.handle(createRequest("/webhooks/api/webhooks/event", {}));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toBe("middle");
    });

    it("should match the root route for the bare prefix path", async () => {
      const router = createWebhookRouter();

      router.register("/", () => Response.json("root"));

      const response = await router.handle(createRequest("/webhooks/", {}));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toBe("root");
    });

    it("should match percent-encoded paths against encoded route keys", async () => {
      const router = createWebhookRouter();

      router.register("/with%20spaces", () => Response.json("encoded"));

      const response = await router.handle(createRequest("/webhooks/with%20spaces", {}));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toBe("encoded");
    });
  });

  describe("Configurable prefix", () => {
    it("should use custom prefix when provided", async () => {
      const router = createWebhookRouter({ prefix: "/api/hooks/" });

      router.register("/payment", {
        handler: ({ payload }) => {
          expect(payload.id).toBe("123");
          return Response.json("success");
        },
        schema: z.object({ id: z.string() }),
      });

      const response = await router.handle(createRequest("/api/hooks/payment", { id: "123" }));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toBe("success");
    });

    it("should return 404 for paths not matching custom prefix", async () => {
      const router = createWebhookRouter({ prefix: "/api/hooks/" });

      router.register("/payment", () => undefined);

      const wrongPrefix = await router.handle(createRequest(PAYMENT_WEBHOOK_PATH, { id: "123" }));
      expect(wrongPrefix.status).toBe(404);

      const noPrefix = await router.handle(createRequest("/payment", { id: "123" }));
      expect(noPrefix.status).toBe(404);
    });

    it("should default to /webhooks prefix when not provided", async () => {
      const router = createWebhookRouter();

      router.register("/test", () => Response.json("success"));

      const response = await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "123" }));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toBe("success");
    });

    it("should handle root prefix", async () => {
      const router = createWebhookRouter({ prefix: "/" });

      router.register("/payment", {
        handler: ({ payload }) => {
          expect(payload.id).toBe("123");
          return Response.json("success");
        },
        schema: z.object({ id: z.string() }),
      });

      const response = await router.handle(createRequest("/payment", { id: "123" }));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toBe("success");
    });

    it("should handle nested paths with custom prefix", async () => {
      const router = createWebhookRouter({ prefix: "/api/v1/webhooks/" });

      let stripeRan = false;
      let githubRan = false;

      router.register("/stripe/events", () => {
        stripeRan = true;
        return undefined;
      });

      router.register("/github/push", () => {
        githubRan = true;
        return undefined;
      });

      const stripeResponse = await router.handle(
        createRequest("/api/v1/webhooks/stripe/events", { type: "payment" }),
      );
      const githubResponse = await router.handle(
        createRequest("/api/v1/webhooks/github/push", { ref: "main" }),
      );

      expect(stripeRan).toBe(true);
      expect(githubRan).toBe(true);
      expect(stripeResponse.status).toBe(200);
      expect(githubResponse.status).toBe(200);
    });

    it("should handle custom prefix with query parameters", async () => {
      const router = createWebhookRouter({ prefix: "/notifications/" });

      router.register("/notify", () => Response.json("notified"));

      const response = await router.handle(
        createRequest("/notifications/notify?priority=high&channel=email", {}),
      );

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toBe("notified");
    });

    it("should normalize a prefix without a trailing slash", async () => {
      const router = createWebhookRouter({ prefix: "/api" });

      router.register("/hello", ({ path }) => {
        expect(path).toBe("/hello");
        return Response.json("ok");
      });

      const response = await router.handle(createRequest("/api/hello", { value: "test" }));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toBe("ok");
    });

    it("should only match the prefix on a path boundary", async () => {
      const router = createWebhookRouter({ prefix: "/api" });

      router.register("/hello", () => Response.json("ok"));
      router.register("/ihello", () => Response.json("ok"));

      const response = await router.handle(createRequest("/apihello", { value: "test" }));

      expect(response.status).toBe(404);
    });
  });
});

describe("Path normalization", () => {
  const createRequest = (path: string): Request =>
    new Request(new URL(path, REQUEST_BASE_URL), {
      body: JSON.stringify({}),
      method: "POST",
    });

  it("should match leading-slash routes under the default /webhooks prefix", async () => {
    const router = createWebhookRouter();

    router.register("/stripe", () => Response.json("ok"));

    const response = await router.handle(createRequest(STRIPE_WEBHOOK_PATH));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toBe("ok");
  });

  it("should normalize registered paths missing a leading slash or with a trailing slash", async () => {
    const router = createWebhookRouter();

    // SAFETY: this test deliberately passes a malformed route key ("stripe/", missing the
    // leading slash and with a trailing slash) to exercise the router's path-normalization
    // behavior; the cast only satisfies the route-key type since real callers pass "/stripe".
    router.register("stripe/" as "/stripe", () => Response.json("ok"));

    const response = await router.handle(createRequest(STRIPE_WEBHOOK_PATH));

    expect(response.status).toBe(200);
  });

  it("should tolerate a trailing slash on the incoming request path", async () => {
    const router = createWebhookRouter();

    router.register("/stripe", () => Response.json("ok"));

    const response = await router.handle(createRequest("/webhooks/stripe/"));

    expect(response.status).toBe(200);
  });

  it("should collapse duplicate slashes in routes and request paths", async () => {
    const router = createWebhookRouter();

    // SAFETY: this test deliberately passes a malformed route key ("//stripe//events", with
    // duplicate slashes) to exercise the router's slash-collapsing normalization behavior; the
    // cast only satisfies the route-key type since real callers pass "/stripe/events".
    router.register("//stripe//events" as "/stripe/events", () => Response.json("ok"));

    const response = await router.handle(createRequest("/webhooks//stripe/events"));

    expect(response.status).toBe(200);
  });

  it("should not match paths where the prefix is only a segment prefix", async () => {
    const router = createWebhookRouter({ prefix: "/hooks" });

    router.register("/stripe", () => Response.json("ok"));

    const response = await router.handle(createRequest("/hooksters/stripe"));

    expect(response.status).toBe(404);
  });

  it("should normalize a prefix missing a leading slash or with a trailing slash", async () => {
    const router = createWebhookRouter({ prefix: "webhooks/" });

    router.register("/stripe", () => Response.json("ok"));

    const response = await router.handle(createRequest(STRIPE_WEBHOOK_PATH));

    expect(response.status).toBe(200);
  });

  it("should mount at the root for an empty prefix", async () => {
    const router = createWebhookRouter({ prefix: "" });

    router.register("/payment", () => Response.json("ok"));

    const response = await router.handle(createRequest("/payment"));

    expect(response.status).toBe(200);
  });

  it("should mount at the root for a bare slash prefix", async () => {
    const router = createWebhookRouter({ prefix: "/" });

    router.register("/payment", () => Response.json("ok"));

    const response = await router.handle(createRequest("/payment"));

    expect(response.status).toBe(200);
  });

  it("should match the root route at the bare prefix with and without a trailing slash", async () => {
    const router = createWebhookRouter();

    router.register("/", () => Response.json("root"));

    const bare = await router.handle(createRequest("/webhooks"));
    const slashed = await router.handle(createRequest("/webhooks/"));

    expect(bare.status).toBe(200);
    expect(slashed.status).toBe(200);
  });

  it("should expose the normalized route path in the handler context", async () => {
    const router = createWebhookRouter();

    let observed: string | null = null;
    router.register("/meta", ({ path }) => {
      observed = path;
      return undefined;
    });

    await router.handle(createRequest("/webhooks/meta"));

    expect(observed).toBe("/meta");
  });
});

describe("@zap-studio/webhooks browser runtime", () => {
  it("routes browser Request objects and preserves response headers", async () => {
    const router = createWebhookRouter().register("/github", ({ path }) => {
      expect(path).toBe("/github");
      return Response.json(
        { ok: true },
        {
          headers: { "x-runtime": "browser" },
          status: 202,
        },
      );
    });

    const response = await router.handle(
      new Request("https://example.com/webhooks/github?delivery=1", {
        body: JSON.stringify({ ok: true }),
        method: "POST",
      }),
    );

    expect(response.status).toBe(202);
    expect(response.headers.get("x-runtime")).toBe("browser");
    await expect(response.json()).resolves.toStrictEqual({ ok: true });
  });
});

describe("logging", () => {
  const createRequest = (path: string, body?: unknown): Request =>
    new Request(new URL(path, REQUEST_BASE_URL), {
      body: body === undefined ? null : JSON.stringify(body),
      method: "POST",
    });

  it("logs a delivery attempt at debug and dispatch at debug on success", async () => {
    const logger = createRecordingLogger();
    const router = createWebhookRouter({ logger }).register("/test", () => undefined);

    await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

    expect(logger.calls).toStrictEqual([
      {
        context: { path: TEST_WEBHOOK_PATH },
        level: "debug",
        message: "webhook delivery attempt",
      },
      {
        context: { path: "/test" },
        level: "debug",
        message: "webhook handler dispatch",
      },
    ]);
  });

  it("logs a warn for an unmatched route", async () => {
    const logger = createRecordingLogger();
    const router = createWebhookRouter({ logger });

    await router.handle(createRequest(UNKNOWN_WEBHOOK_PATH, { id: "1" }));

    expect(logger.calls).toStrictEqual([
      {
        context: { path: UNKNOWN_WEBHOOK_PATH },
        level: "debug",
        message: "webhook delivery attempt",
      },
      {
        context: { path: "/unknown" },
        level: "warn",
        message: "webhook route not matched",
      },
    ]);
  });

  it("logs a warn when verification fails", async () => {
    const logger = createRecordingLogger();
    const router = createWebhookRouter({
      logger,
      onError: () => Response.json({}, { status: 401 }),
      verify: createHmacVerifier({
        headerName: SIGNATURE_HEADER_NAME,
        secret: "secret",
      }),
    });
    router.register("/test", () => undefined);

    await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

    const warnCall = logger.calls.find((call) => call.message === "webhook verification failed");
    expect(warnCall).toBeDefined();
    expect(warnCall?.context?.["path"]).toBe("/test");
  });

  it("does not log anything when no logger is provided", async () => {
    const router = createWebhookRouter().register("/test", () => undefined);

    const response = await router.handle(createRequest(TEST_WEBHOOK_PATH, { id: "1" }));

    expect(response.status).toBe(200);
  });
});
