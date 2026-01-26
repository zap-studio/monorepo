import { describe, expect, it, vi } from "vitest";
import { EventBus } from "../src";

interface TestEventMap {
  join: { email: string };
  leave: { email: string };
  error: { err: unknown; source: keyof TestEventMap };
}

describe("EventBus", () => {
  it("should emit events to subscribers", async () => {
    const bus = new EventBus<TestEventMap>({
      errorEventType: "error",
      errorEventPayload: (err, source) => ({ err, source }),
    });
    const handler = vi.fn();

    bus.on("join", handler);
    await bus.emit("join", { email: "test@example.com" });

    expect(handler).toHaveBeenCalledWith({ email: "test@example.com" });
  });

  it("should allow multiple handlers for the same event", async () => {
    const bus = new EventBus<TestEventMap>();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    bus.on("join", handler1);
    bus.on("join", handler2);

    await bus.emit("join", { email: "test@example.com" });

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it("should unsubscribe handlers", async () => {
    const bus = new EventBus<TestEventMap>();
    const handler = vi.fn();

    const unsubscribe = bus.on("join", handler);
    unsubscribe();

    await bus.emit("join", { email: "test@example.com" });

    expect(handler).not.toHaveBeenCalled();
  });

  it("should ignore off when handler is missing", async () => {
    const bus = new EventBus<TestEventMap>();
    const handler = vi.fn();

    bus.off("join", handler);
    await bus.emit("join", { email: "test@example.com" });

    expect(handler).not.toHaveBeenCalled();
  });

  it("should keep handlers when off is called with a different handler", async () => {
    const bus = new EventBus<TestEventMap>();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    bus.on("join", handler1);
    bus.off("join", handler2);

    await bus.emit("join", { email: "test@example.com" });

    expect(handler1).toHaveBeenCalledTimes(1);
  });

  it("should only fire once for once handlers", async () => {
    const bus = new EventBus<TestEventMap>();
    const handler = vi.fn();

    bus.once("join", handler);

    await bus.emit("join", { email: "test@example.com" });
    await bus.emit("join", { email: "other@example.com" });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ email: "test@example.com" });
  });

  it("should clear handlers and report listener counts", async () => {
    const bus = new EventBus<TestEventMap>();
    const handler = vi.fn();

    bus.on("join", handler);
    bus.on("leave", handler);

    expect(bus.listenerCount("join")).toBe(1);
    expect(bus.listenerCount("leave")).toBe(1);

    bus.clear("join");
    await bus.emit("join", { email: "test@example.com" });
    await bus.emit("leave", { email: "test@example.com" });

    expect(handler).toHaveBeenCalledTimes(1);

    bus.clear();
    await bus.emit("leave", { email: "test@example.com" });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should return zero listener count when no handlers exist", () => {
    const bus = new EventBus<TestEventMap>();

    expect(bus.listenerCount("join")).toBe(0);
  });

  it("should swallow errors when no error handler is configured", async () => {
    const bus = new EventBus<TestEventMap>();

    bus.on("join", () => {
      throw new Error("boom");
    });

    await expect(
      bus.emit("join", { email: "test@example.com" })
    ).resolves.not.toThrow();
  });

  it("should emit error events when handlers throw", async () => {
    const onError = vi.fn();
    const errorHandler = vi.fn();
    const bus = new EventBus<TestEventMap>({
      onError,
      errorEventType: "error",
      errorEventPayload: (err, source) => ({ err, source }),
    });

    bus.on("error", errorHandler);
    bus.on("join", () => {
      throw new Error("boom");
    });

    await bus.emit("join", { email: "test@example.com" });

    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it("should report when error payload generation throws", async () => {
    const onError = vi.fn();
    const bus = new EventBus<TestEventMap>({
      onError,
      errorEventType: "error",
      errorEventPayload: () => {
        throw new Error("payload failed");
      },
    });

    bus.on("join", () => {
      throw new Error("boom");
    });

    await bus.emit("join", { email: "test@example.com" });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(Error), {
      event: "join",
      errorEmitFailed: expect.any(Error),
    });
  });

  it("should report errors if error handlers throw", async () => {
    const onError = vi.fn();
    const bus = new EventBus<TestEventMap>({
      onError,
      errorEventType: "error",
      errorEventPayload: (err, source) => ({ err, source }),
    });

    bus.on("error", () => {
      throw new Error("error handler failed");
    });

    bus.on("join", () => {
      throw new Error("boom");
    });

    await bus.emit("join", { email: "test@example.com" });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(Error), {
      event: "error",
    });
  });

  it("should report errors directly when error emission is not configured", async () => {
    const onError = vi.fn();
    const bus = new EventBus<TestEventMap>({ onError });

    bus.on("join", () => {
      throw new Error("boom");
    });

    await bus.emit("join", { email: "test@example.com" });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(Error), {
      event: "join",
    });
  });

  it("should report errors when error event type is configured without a payload", async () => {
    const onError = vi.fn();
    const bus = new EventBus<TestEventMap>({
      onError,
      errorEventType: "error",
    });

    bus.on("join", () => {
      throw new Error("boom");
    });

    await bus.emit("join", { email: "test@example.com" });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.any(Error), {
      event: "join",
    });
  });

  it("should use the logger when onError is not provided", async () => {
    const logger = { error: vi.fn() };
    const bus = new EventBus<TestEventMap>({ logger });

    bus.on("join", () => {
      throw new Error("boom");
    });

    await bus.emit("join", { email: "test@example.com" });

    expect(logger.error).toHaveBeenCalledTimes(1);
  });
});
