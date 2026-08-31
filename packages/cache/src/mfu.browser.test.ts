import { describe, expect, it } from "vitest";

import { mfu } from "./mfu.ts";

describe("mfu", () => {
  it("evicts the most frequently used key first", () => {
    const policy = mfu<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onGet("a");

    expect(policy.evict()).toBe("a");
  });

  it("breaks ties within the same frequency by oldest insertion", () => {
    const policy = mfu<string>();

    policy.onSet("a");
    policy.onSet("b");

    expect(policy.evict()).toBe("a");
  });

  it("bumps frequency for an existing key on a repeated onSet", () => {
    const policy = mfu<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onSet("a");

    expect(policy.evict()).toBe("a");
  });

  it("orders eviction by accumulated access frequency across many keys", () => {
    const policy = mfu<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onSet("c");
    policy.onGet("a");
    policy.onGet("a");
    policy.onGet("b");

    expect(policy.evict()).toBe("a");
    expect(policy.evict()).toBe("b");
    expect(policy.evict()).toBe("c");
  });

  it("removes a key from eviction entirely on onDelete", () => {
    const policy = mfu<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onDelete("a");

    expect(policy.evict()).toBe("b");
    expect(policy.evict()).toBeUndefined();
  });

  it("removes the emptied frequency bucket when onDelete takes its sole key", () => {
    const policy = mfu<string>();

    policy.onSet("a");
    policy.onGet("a");
    policy.onDelete("a");
    policy.onSet("b");

    expect(policy.evict()).toBe("b");
  });

  it("onDelete on an untracked key is a no-op", () => {
    const policy = mfu<string>();

    policy.onSet("a");
    policy.onDelete("missing");

    expect(policy.evict()).toBe("a");
  });

  it("onGet on an untracked key is a no-op", () => {
    const policy = mfu<string>();

    policy.onGet("missing");
    policy.onSet("a");

    expect(policy.evict()).toBe("a");
  });

  it("falls back to a lower frequency bucket once the highest is exhausted", () => {
    const policy = mfu<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onGet("a");
    policy.onGet("b");

    expect(policy.evict()).toBe("a");
    expect(policy.evict()).toBe("b");
  });

  it("returns undefined from evict when empty", () => {
    const policy = mfu<string>();

    expect(policy.evict()).toBeUndefined();
  });

  it("evict removes the returned key from future eviction", () => {
    const policy = mfu<string>();

    policy.onSet("a");
    policy.onSet("b");
    policy.onSet("c");
    policy.onGet("c");
    policy.onGet("c");
    policy.onGet("b");

    expect(policy.evict()).toBe("c");
    expect(policy.evict()).toBe("b");
    expect(policy.evict()).toBe("a");
    expect(policy.evict()).toBeUndefined();
  });

  it("resets all state on clear", () => {
    const policy = mfu<string>();

    policy.onSet("a");
    policy.onGet("a");
    policy.onGet("a");
    policy.clear();
    policy.onSet("b");

    expect(policy.evict()).toBe("b");
  });
});
