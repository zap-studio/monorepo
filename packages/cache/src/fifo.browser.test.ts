import { describe, expect, it } from "vitest";

import { fifo } from "./fifo.ts";

describe("fifo", () => {
  it("evicts the oldest inserted key first", () => {
    const policy = fifo<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onSet("c");

    expect(policy.evict()).toBe("a");
  });

  it("ignores access pattern: onGet does not change eviction order", () => {
    const policy = fifo<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onGet("a");

    expect(policy.evict()).toBe("a");
  });

  it("does not requeue a key that already exists on a repeated onSet", () => {
    const policy = fifo<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onSet("a");

    expect(policy.evict()).toBe("a");
  });

  it("removes a key from eviction order on onDelete", () => {
    const policy = fifo<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onDelete("a");

    expect(policy.evict()).toBe("b");
  });

  it("returns undefined from evict when empty", () => {
    const policy = fifo<string>();

    expect(policy.evict()).toBeUndefined();
  });

  it("evict removes the returned key from future eviction", () => {
    const policy = fifo<string>();

    policy.onSet("a");
    policy.onSet("b");

    expect(policy.evict()).toBe("a");
    expect(policy.evict()).toBe("b");
    expect(policy.evict()).toBeUndefined();
  });

  it("resets all state on clear", () => {
    const policy = fifo<string>();

    policy.onSet("a");
    policy.clear();
    policy.onSet("b");

    expect(policy.evict()).toBe("b");
  });
});
