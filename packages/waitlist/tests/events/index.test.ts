// biome-ignore-all lint/style/noMagicNumbers: This is a test file so magic numbers are fine.

import { EventBus } from "@zap-studio/events";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WaitlistEventPayloadMap } from "../../src/types";

describe("EventBus", () => {
  let bus: EventBus<WaitlistEventPayloadMap>;

  beforeEach(() => {
    bus = new EventBus<WaitlistEventPayloadMap>({
      errorEventType: "error",
      errorEventPayload: (err, source) => ({ err, source }),
    });
  });

  describe("on", () => {
    it("should subscribe to an event", async () => {
      const handler = vi.fn();
      bus.on("join", handler);

      await bus.emit("join", { email: "test@example.com" });

      expect(handler).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should allow multiple handlers for the same event", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      bus.on("join", handler1);
      bus.on("join", handler2);

      await bus.emit("join", { email: "test@example.com" });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it("should return an unsubscribe function", async () => {
      const handler = vi.fn();
      const unsubscribe = bus.on("join", handler);

      await bus.emit("join", { email: "test@example.com" });
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();

      await bus.emit("join", { email: "another@example.com" });
      expect(handler).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it("should handle async handlers", async () => {
      const handler = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      bus.on("join", handler);

      await bus.emit("join", { email: "test@example.com" });

      expect(handler).toHaveBeenCalledWith({ email: "test@example.com" });
    });

    it("should handle referral events", async () => {
      const handler = vi.fn();
      bus.on("referral", handler);

      await bus.emit("referral", {
        referrer: "referrer@example.com",
        referee: "referee@example.com",
      });

      expect(handler).toHaveBeenCalledWith({
        referrer: "referrer@example.com",
        referee: "referee@example.com",
      });
    });

    it("should handle leave events with optional reason", async () => {
      const handler = vi.fn();
      bus.on("leave", handler);

      await bus.emit("leave", {
        email: "test@example.com",
        reason: "User requested removal",
      });

      expect(handler).toHaveBeenCalledWith({
        email: "test@example.com",
        reason: "User requested removal",
      });
    });
  });

  describe("once", () => {
    it("should only fire once", async () => {
      const handler = vi.fn();
      bus.once("join", handler);

      await bus.emit("join", { email: "test@example.com" });
      await bus.emit("join", { email: "another@example.com" });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ email: "test@example.com" });
    });

    it("should return an unsubscribe function", async () => {
      const handler = vi.fn();
      const unsubscribe = bus.once("join", handler);

      unsubscribe();

      await bus.emit("join", { email: "test@example.com" });

      expect(handler).not.toHaveBeenCalled();
    });

    it("should handle async handlers", async () => {
      const handler = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      bus.once("join", handler);

      await bus.emit("join", { email: "test@example.com" });
      await bus.emit("join", { email: "another@example.com" });

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("off", () => {
    it("should unsubscribe from an event", async () => {
      const handler = vi.fn();
      bus.on("join", handler);

      await bus.emit("join", { email: "test@example.com" });
      expect(handler).toHaveBeenCalledTimes(1);

      bus.off("join", handler);

      await bus.emit("join", { email: "another@example.com" });
      expect(handler).toHaveBeenCalledTimes(1); // Still 1
    });

    it("should only leave the specific handler", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      bus.on("join", handler1);
      bus.on("join", handler2);

      bus.off("join", handler1);

      await bus.emit("join", { email: "test@example.com" });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it("should handle removing a non-existent handler gracefully", () => {
      const handler = vi.fn();

      expect(() => {
        bus.off("join", handler);
      }).not.toThrow();
    });
  });

  describe("emit", () => {
    it("should call all handlers in order", async () => {
      const calls: number[] = [];

      bus.on("join", () => {
        calls.push(1);
      });
      bus.on("join", () => {
        calls.push(2);
      });
      bus.on("join", () => {
        calls.push(3);
      });

      await bus.emit("join", { email: "test@example.com" });

      expect(calls).toEqual([1, 2, 3]);
    });

    it("should handle errors in handlers by emitting error events", async () => {
      const errorHandler = vi.fn();
      const testError = new Error("Test error");

      bus.on("error", errorHandler);
      bus.on("join", () => {
        throw testError;
      });

      await bus.emit("join", { email: "test@example.com" });

      expect(errorHandler).toHaveBeenCalledWith({
        err: testError,
        source: "join",
      });
    });

    it("should continue executing other handlers after one throws", async () => {
      const handler1 = vi.fn(() => {
        throw new Error("Handler 1 error");
      });
      const handler2 = vi.fn();

      bus.on("join", handler1);
      bus.on("join", handler2);

      await bus.emit("join", { email: "test@example.com" });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it("should report errors if error handler throws", async () => {
      const onError = vi.fn();
      bus = new EventBus<WaitlistEventPayloadMap>({
        onError,
        errorEventType: "error",
        errorEventPayload: (err, source) => ({ err, source }),
      });

      bus.on("error", () => {
        throw new Error("Error handler error");
      });

      bus.on("join", () => {
        throw new Error("Original error");
      });

      await bus.emit("join", { email: "test@example.com" });

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(expect.any(Error), {
        event: "error",
      });
    });

    it("should handle events with no handlers gracefully", async () => {
      await expect(
        bus.emit("join", { email: "test@example.com" })
      ).resolves.not.toThrow();
    });

    it("should handle all event types correctly", async () => {
      const joinHandler = vi.fn();
      const referralHandler = vi.fn();
      const removeHandler = vi.fn();
      const errorHandler = vi.fn();

      bus.on("join", joinHandler);
      bus.on("referral", referralHandler);
      bus.on("leave", removeHandler);
      bus.on("error", errorHandler);

      await bus.emit("join", { email: "test@example.com" });
      await bus.emit("referral", {
        referrer: "referrer@example.com",
        referee: "referee@example.com",
      });
      await bus.emit("leave", { email: "test@example.com" });
      await bus.emit("error", { err: new Error("Test"), source: "join" });

      expect(joinHandler).toHaveBeenCalledTimes(1);
      expect(referralHandler).toHaveBeenCalledTimes(1);
      expect(removeHandler).toHaveBeenCalledTimes(1);
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe("clear", () => {
    it("should clear all handlers for a specific event type", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      bus.on("join", handler1);
      bus.on("referral", handler2);

      bus.clear("join");

      await bus.emit("join", { email: "test@example.com" });
      await bus.emit("referral", {
        referrer: "referrer@example.com",
        referee: "referee@example.com",
      });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it("should clear all handlers for all event types when no type specified", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      bus.on("join", handler1);
      bus.on("referral", handler2);
      bus.on("leave", handler3);

      bus.clear();

      await bus.emit("join", { email: "test@example.com" });
      await bus.emit("referral", {
        referrer: "referrer@example.com",
        referee: "referee@example.com",
      });
      await bus.emit("leave", { email: "test@example.com" });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
      expect(handler3).not.toHaveBeenCalled();
    });
  });

  describe("listenerCount", () => {
    it("should return the correct number of handlers", () => {
      expect(bus.listenerCount("join")).toBe(0);

      // biome-ignore lint/suspicious/noEmptyBlockStatements: We just need empty handlers here.
      bus.on("join", () => {});
      expect(bus.listenerCount("join")).toBe(1);

      // biome-ignore lint/suspicious/noEmptyBlockStatements: We just need empty handlers here.
      bus.on("join", () => {});
      expect(bus.listenerCount("join")).toBe(2);

      // biome-ignore lint/suspicious/noEmptyBlockStatements: We just need empty handlers here.
      bus.on("referral", () => {});
      expect(bus.listenerCount("referral")).toBe(1);
      expect(bus.listenerCount("join")).toBe(2);
    });

    it("should update count after unsubscribe", () => {
      // biome-ignore lint/suspicious/noEmptyBlockStatements: We just need empty handlers here.
      const handler1 = () => {};
      // biome-ignore lint/suspicious/noEmptyBlockStatements: We just need empty handlers here.
      const handler2 = () => {};

      bus.on("join", handler1);
      bus.on("join", handler2);

      expect(bus.listenerCount("join")).toBe(2);

      bus.off("join", handler1);

      expect(bus.listenerCount("join")).toBe(1);
    });

    it("should update count after clear", () => {
      // biome-ignore lint/suspicious/noEmptyBlockStatements: We just need empty handlers here.
      bus.on("join", () => {});
      // biome-ignore lint/suspicious/noEmptyBlockStatements: We just need empty handlers here.
      bus.on("join", () => {});

      expect(bus.listenerCount("join")).toBe(2);

      bus.clear("join");

      expect(bus.listenerCount("join")).toBe(0);
    });
  });

  describe("error handling edge cases", () => {
    it("should not emit error event recursively if error handler is the source", async () => {
      const onError = vi.fn();
      bus = new EventBus<WaitlistEventPayloadMap>({
        onError,
        errorEventType: "error",
        errorEventPayload: (err, source) => ({ err, source }),
      });

      const errorCount = { count: 0 };

      bus.on("error", () => {
        errorCount.count += 1;
        throw new Error("Error in error handler");
      });

      await bus.emit("error", {
        err: new Error("Original error"),
        source: "join",
      });

      // Should only be called once, not recursively
      expect(errorCount.count).toBe(1);
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(expect.any(Error), {
        event: "error",
      });
    });

    it("should report errors if error handler throws while emitting error event", async () => {
      const onError = vi.fn();
      bus = new EventBus<WaitlistEventPayloadMap>({
        onError,
        errorEventType: "error",
        errorEventPayload: (err, source) => ({ err, source }),
      });

      // Make error handler throw
      bus.on("error", () => {
        throw new Error("Error handler throws");
      });

      // Make join handler throw (which will try to emit error)
      bus.on("join", () => {
        throw new Error("Join handler error");
      });

      await bus.emit("join", { email: "test@example.com" });

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(expect.any(Error), {
        event: "error",
      });
    });
  });

  describe("complex scenarios", () => {
    it("should handle multiple subscriptions and unsubscriptions", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      const unsub1 = bus.on("join", handler1);
      const unsub2 = bus.on("join", handler2);
      bus.on("join", handler3);

      await bus.emit("join", { email: "test@example.com" });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);

      unsub1();
      unsub2();

      await bus.emit("join", { email: "another@example.com" });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(2);
    });

    it("should handle mix of once and regular handlers", async () => {
      const regularHandler = vi.fn();
      const onceHandler = vi.fn();

      bus.on("join", regularHandler);
      bus.once("join", onceHandler);

      await bus.emit("join", { email: "test@example.com" });
      await bus.emit("join", { email: "another@example.com" });

      expect(regularHandler).toHaveBeenCalledTimes(2);
      expect(onceHandler).toHaveBeenCalledTimes(1);
    });

    it("should maintain separate handler lists for different event types", async () => {
      const joinHandler = vi.fn();
      const referralHandler = vi.fn();
      const removeHandler = vi.fn();

      bus.on("join", joinHandler);
      bus.on("referral", referralHandler);
      bus.on("leave", removeHandler);

      await bus.emit("join", { email: "test@example.com" });

      expect(joinHandler).toHaveBeenCalledTimes(1);
      expect(referralHandler).not.toHaveBeenCalled();
      expect(removeHandler).not.toHaveBeenCalled();
    });

    it("should handle rapid sequential events", async () => {
      const handler = vi.fn();
      bus.on("join", handler);

      const emails = [
        "user1@example.com",
        "user2@example.com",
        "user3@example.com",
      ];

      for (const email of emails) {
        await bus.emit("join", { email });
      }

      expect(handler).toHaveBeenCalledTimes(3);
      expect(handler).toHaveBeenNthCalledWith(1, {
        email: "user1@example.com",
      });
      expect(handler).toHaveBeenNthCalledWith(2, {
        email: "user2@example.com",
      });
      expect(handler).toHaveBeenNthCalledWith(3, {
        email: "user3@example.com",
      });
    });
  });
});
