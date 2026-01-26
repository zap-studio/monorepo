import { describe, expect, it, vi } from "vitest";
import { EventBus } from "../src";

interface TestEventMap {
  join: { email: string };
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
});
