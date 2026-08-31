import { describe, expect, it } from "vitest";

import { mru } from "./mru.ts";

describe("mru", () => {
  it("evicts the most recently used key first", () => {
    const policy = mru<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onSet("c");

    expect(policy.evict()).toBe("c");
  });

  it("moves a key to most-recently-used on onGet", () => {
    const policy = mru<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onGet("a");

    expect(policy.evict()).toBe("a");
  });

  it("moves a key to most-recently-used on a repeated onSet", () => {
    const policy = mru<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onSet("a");

    expect(policy.evict()).toBe("a");
  });

  it("removes a key from eviction order on onDelete", () => {
    const policy = mru<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onDelete("b");

    expect(policy.evict()).toBe("a");
  });

  it("onDelete on an untracked key is a no-op", () => {
    const policy = mru<string>();

    policy.onSet("a");
    policy.onDelete("missing");

    expect(policy.evict()).toBe("a");
  });

  it("relinks neighbors when onDelete removes a middle key", () => {
    const policy = mru<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onSet("c");
    policy.onDelete("b");

    expect(policy.evict()).toBe("c");
    expect(policy.evict()).toBe("a");
  });

  it("returns undefined from evict when empty", () => {
    const policy = mru<string>();

    expect(policy.evict()).toBeUndefined();
  });

  it("evict removes the returned key from future eviction", () => {
    const policy = mru<string>();

    policy.onSet("a");
    policy.onSet("b");

    expect(policy.evict()).toBe("b");
    expect(policy.evict()).toBe("a");
    expect(policy.evict()).toBeUndefined();
  });

  it("resets all state on clear", () => {
    const policy = mru<string>();

    policy.onSet("a");
    policy.clear();
    policy.onSet("b");

    expect(policy.evict()).toBe("b");
  });
});
