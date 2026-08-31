import { describe, expect, it } from "vitest";

import { lru } from "./lru.ts";

describe("lru", () => {
  it("evicts the least recently used key first", () => {
    const policy = lru<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onSet("c");

    expect(policy.evict()).toBe("a");
  });

  it("moves a key to most-recently-used on onGet", () => {
    const policy = lru<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onGet("a");

    expect(policy.evict()).toBe("b");
  });

  it("moves a key to most-recently-used on a repeated onSet", () => {
    const policy = lru<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onSet("a");

    expect(policy.evict()).toBe("b");
  });

  it("removes a key from eviction order on onDelete", () => {
    const policy = lru<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onDelete("a");

    expect(policy.evict()).toBe("b");
  });

  it("returns undefined from evict when empty", () => {
    const policy = lru<string>();

    expect(policy.evict()).toBeUndefined();
  });

  it("evict removes the returned key from future eviction", () => {
    const policy = lru<string>();

    policy.onSet("a");
    policy.onSet("b");

    expect(policy.evict()).toBe("a");
    expect(policy.evict()).toBe("b");
    expect(policy.evict()).toBeUndefined();
  });

  it("resets all state on clear", () => {
    const policy = lru<string>();

    policy.onSet("a");
    policy.clear();
    policy.onSet("b");

    expect(policy.evict()).toBe("b");
  });
});
