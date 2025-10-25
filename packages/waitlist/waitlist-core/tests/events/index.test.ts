import { describe, it, expect, beforeEach, vi } from "vitest";
import { EventBus } from "../../src/events";

describe("EventBus", () => {
	let bus: EventBus;

	beforeEach(() => {
		bus = new EventBus();
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
				referrerId: "referrer@example.com",
				refereeId: "referee@example.com",
			});

			expect(handler).toHaveBeenCalledWith({
				referrerId: "referrer@example.com",
				refereeId: "referee@example.com",
			});
		});

		it("should handle remove events with optional reason", async () => {
			const handler = vi.fn();
			bus.on("remove", handler);

			await bus.emit("remove", {
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

		it("should only remove the specific handler", async () => {
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

			bus.on("join", async () => {
				calls.push(1);
			});
			bus.on("join", async () => {
				calls.push(2);
			});
			bus.on("join", async () => {
				calls.push(3);
			});

			await bus.emit("join", { email: "test@example.com" });

			expect(calls).toEqual([1, 2, 3]);
		});

		it("should handle errors in handlers by emitting error events", async () => {
			const errorHandler = vi.fn();
			const testError = new Error("Test error");

			bus.on("error", errorHandler);
			bus.on("join", async () => {
				throw testError;
			});

			await bus.emit("join", { email: "test@example.com" });

			expect(errorHandler).toHaveBeenCalledWith({
				err: testError,
				source: "join",
			});
		});

		it("should continue executing other handlers after one throws", async () => {
			const handler1 = vi.fn(async () => {
				throw new Error("Handler 1 error");
			});
			const handler2 = vi.fn();

			bus.on("join", handler1);
			bus.on("join", handler2);

			await bus.emit("join", { email: "test@example.com" });

			expect(handler1).toHaveBeenCalledTimes(1);
			expect(handler2).toHaveBeenCalledTimes(1);
		});

		it("should log to console if error handler throws", async () => {
			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			bus.on("error", async () => {
				throw new Error("Error handler error");
			});

			bus.on("join", async () => {
				throw new Error("Original error");
			});

			await bus.emit("join", { email: "test@example.com" });

			expect(consoleErrorSpy).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
		});

		it("should handle events with no handlers gracefully", async () => {
			await expect(
				bus.emit("join", { email: "test@example.com" }),
			).resolves.not.toThrow();
		});

		it("should handle all event types correctly", async () => {
			const joinHandler = vi.fn();
			const referralHandler = vi.fn();
			const removeHandler = vi.fn();
			const errorHandler = vi.fn();

			bus.on("join", joinHandler);
			bus.on("referral", referralHandler);
			bus.on("remove", removeHandler);
			bus.on("error", errorHandler);

			await bus.emit("join", { email: "test@example.com" });
			await bus.emit("referral", {
				referrerId: "referrer@example.com",
				refereeId: "referee@example.com",
			});
			await bus.emit("remove", { email: "test@example.com" });
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
				referrerId: "referrer@example.com",
				refereeId: "referee@example.com",
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
			bus.on("remove", handler3);

			bus.clear();

			await bus.emit("join", { email: "test@example.com" });
			await bus.emit("referral", {
				referrerId: "referrer@example.com",
				refereeId: "referee@example.com",
			});
			await bus.emit("remove", { email: "test@example.com" });

			expect(handler1).not.toHaveBeenCalled();
			expect(handler2).not.toHaveBeenCalled();
			expect(handler3).not.toHaveBeenCalled();
		});
	});

	describe("listenerCount", () => {
		it("should return the correct number of handlers", () => {
			expect(bus.listenerCount("join")).toBe(0);

			bus.on("join", () => {});
			expect(bus.listenerCount("join")).toBe(1);

			bus.on("join", () => {});
			expect(bus.listenerCount("join")).toBe(2);

			bus.on("referral", () => {});
			expect(bus.listenerCount("referral")).toBe(1);
			expect(bus.listenerCount("join")).toBe(2);
		});

		it("should update count after unsubscribe", () => {
			const handler1 = () => {};
			const handler2 = () => {};

			bus.on("join", handler1);
			bus.on("join", handler2);

			expect(bus.listenerCount("join")).toBe(2);

			bus.off("join", handler1);

			expect(bus.listenerCount("join")).toBe(1);
		});

		it("should update count after clear", () => {
			bus.on("join", () => {});
			bus.on("join", () => {});

			expect(bus.listenerCount("join")).toBe(2);

			bus.clear("join");

			expect(bus.listenerCount("join")).toBe(0);
		});
	});

	describe("error handling edge cases", () => {
		it("should not emit error event recursively if error handler is the source", async () => {
			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			const errorCount = { count: 0 };

			bus.on("error", async () => {
				errorCount.count++;
				throw new Error("Error in error handler");
			});

			await bus.emit("error", {
				err: new Error("Original error"),
				source: "join",
			});

			// Should only be called once, not recursively
			expect(errorCount.count).toBe(1);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"EventBus: Error handler threw an error",
				expect.any(Error),
			);

			consoleErrorSpy.mockRestore();
		});

		it("should log to console if emitting error event fails", async () => {
			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			// Make error handler throw
			bus.on("error", async () => {
				throw new Error("Error handler throws");
			});

			// Make join handler throw (which will try to emit error)
			bus.on("join", async () => {
				throw new Error("Join handler error");
			});

			await bus.emit("join", { email: "test@example.com" });

			expect(consoleErrorSpy).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
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
			bus.on("remove", removeHandler);

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
