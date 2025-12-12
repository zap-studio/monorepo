import type { StandardSchemaV1 } from "@standard-schema/spec";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createInMemoryEmitter } from "../src/emitters/in-memory";
import { createEvents } from "../src/events";
import { ValidationError, validateSchema } from "../src/schema";
import { formatHeartbeat, formatSSEMessage } from "../src/transport/sse/server";
import type { EventMessage } from "../src/types";

// Mock Standard Schema for testing
function createMockSchema<T>(
  validator: (input: unknown) => T
): StandardSchemaV1<T> {
  return {
    "~standard": {
      version: 1 as const,
      vendor: "test",
      validate: (input: unknown): StandardSchemaV1.Result<T> => {
        try {
          const value = validator(input);
          return { value };
        } catch (error) {
          return {
            issues: [
              {
                message:
                  error instanceof Error ? error.message : "Validation failed",
              },
            ],
          };
        }
      },
    },
  };
}

const messageSchema = createMockSchema((input) => {
  if (
    typeof input !== "object" ||
    input === null ||
    !("title" in input) ||
    !("body" in input)
  ) {
    throw new Error("Invalid message format");
  }
  const obj = input as Record<string, unknown>;
  if (typeof obj.title !== "string" || typeof obj.body !== "string") {
    throw new Error("title and body must be strings");
  }
  return { title: obj.title, body: obj.body };
});

const presenceSchema = createMockSchema((input) => {
  if (
    typeof input !== "object" ||
    input === null ||
    !("userId" in input) ||
    !("online" in input)
  ) {
    throw new Error("Invalid presence format");
  }
  const obj = input as Record<string, unknown>;
  if (typeof obj.userId !== "string" || typeof obj.online !== "boolean") {
    throw new Error("userId must be string, online must be boolean");
  }
  return { userId: obj.userId, online: obj.online };
});

const testSchemas = {
  message: messageSchema,
  presence: presenceSchema,
};

describe("@zap-studio/realtime", () => {
  describe("createEvents", () => {
    it("should create events API with schemas", () => {
      const events = createEvents(testSchemas);

      expect(events.schemas).toBe(testSchemas);
      expect(typeof events.validate).toBe("function");
    });

    it("should validate data against schema", async () => {
      const events = createEvents(testSchemas);

      const validData = { title: "Hello", body: "World" };
      const result = await events.validate("message", validData);

      expect(result).toEqual(validData);
    });

    it("should throw on invalid data", async () => {
      const events = createEvents(testSchemas);

      await expect(
        events.validate("message", { invalid: "data" })
      ).rejects.toThrow();
    });
  });

  describe("InMemoryEmitter", () => {
    let emitter: ReturnType<typeof createInMemoryEmitter>;

    beforeEach(() => {
      emitter = createInMemoryEmitter();
    });

    afterEach(async () => {
      await emitter.close();
    });

    it("should create emitter instance", () => {
      expect(emitter).toBeDefined();
      expect(typeof emitter.subscribe).toBe("function");
      expect(typeof emitter.publish).toBe("function");
      expect(typeof emitter.close).toBe("function");
    });

    it("should publish and receive events", async () => {
      const receivedEvents: EventMessage[] = [];
      const controller = new AbortController();

      // Start subscription in background
      const subscriptionPromise = (async () => {
        for await (const event of emitter.subscribe({
          signal: controller.signal,
        })) {
          receivedEvents.push(event);
          if (receivedEvents.length >= 2) {
            controller.abort();
          }
        }
      })();

      // Give subscription time to start
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Publish events
      await emitter.publish("message", { title: "Test", body: "Hello" });
      await emitter.publish("presence", { userId: "123", online: true });

      // Wait for subscription to complete
      await subscriptionPromise;

      expect(receivedEvents).toHaveLength(2);
      expect(receivedEvents[0]?.event).toBe("message");
      expect(receivedEvents[0]?.data).toEqual({ title: "Test", body: "Hello" });
      expect(receivedEvents[1]?.event).toBe("presence");
    });

    it("should track subscriber count", async () => {
      expect(emitter.subscriberCount).toBe(0);

      const controller = new AbortController();
      const subscriptionPromise = (async () => {
        for await (const _ of emitter.subscribe({
          signal: controller.signal,
        })) {
          // Just iterate
        }
      })();

      // Give subscription time to start
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(emitter.subscriberCount).toBe(1);

      controller.abort();
      await subscriptionPromise;

      // Give time for cleanup
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(emitter.subscriberCount).toBe(0);
    });

    it("should filter events by channel", async () => {
      const receivedEvents: EventMessage[] = [];
      const controller = new AbortController();

      const subscriptionPromise = (async () => {
        for await (const event of emitter.subscribe({
          channel: "channel-1",
          signal: controller.signal,
        })) {
          receivedEvents.push(event);
          if (receivedEvents.length >= 1) {
            controller.abort();
          }
        }
      })();

      await new Promise((resolve) => setTimeout(resolve, 10));

      // This should NOT be received (different channel)
      await emitter.publish(
        "message",
        { title: "Wrong", body: "Channel" },
        { channel: "channel-2" }
      );

      // This should be received
      await emitter.publish(
        "message",
        { title: "Right", body: "Channel" },
        { channel: "channel-1" }
      );

      await subscriptionPromise;

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0]?.data).toEqual({
        title: "Right",
        body: "Channel",
      });
    });
  });

  describe("validateSchema", () => {
    it("should validate valid data", async () => {
      const result = await validateSchema(messageSchema, {
        title: "Test",
        body: "Hello",
      });
      expect(result).toEqual({ title: "Test", body: "Hello" });
    });

    it("should throw ValidationError for invalid data", async () => {
      await expect(
        validateSchema(messageSchema, { invalid: "data" })
      ).rejects.toThrow(ValidationError);
    });

    it("should return result object when throwOnError is false", async () => {
      const result = await validateSchema(
        messageSchema,
        { invalid: "data" },
        false
      );
      expect(result).toHaveProperty("issues");
    });
  });

  describe("SSE formatting", () => {
    it("should format SSE message correctly", () => {
      const message: EventMessage = {
        id: "test-123",
        event: "message",
        data: { title: "Hello", body: "World" },
        timestamp: 1_234_567_890,
      };

      const formatted = formatSSEMessage(message);

      expect(formatted).toContain("id: test-123");
      expect(formatted).toContain("event: message");
      expect(formatted).toContain("data:");
      expect(formatted).toContain('"title":"Hello"');
      expect(formatted).toContain('"body":"World"');
      expect(formatted.endsWith("\n\n")).toBe(true);
    });

    it("should include retry field when specified", () => {
      const message: EventMessage = {
        id: "test-123",
        event: "message",
        data: { title: "Hello", body: "World" },
        timestamp: 1_234_567_890,
        retry: 5000,
      };

      const formatted = formatSSEMessage(message);

      expect(formatted).toContain("retry: 5000");
    });

    it("should format heartbeat correctly", () => {
      const heartbeat = formatHeartbeat();

      expect(heartbeat).toMatch(/^: heartbeat \d+\n\n$/);
    });
  });
});
