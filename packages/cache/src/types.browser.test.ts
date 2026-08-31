import { describe, expect, it } from "vitest";

import type { CacheOptions, EvictionPolicy, SetOptions } from "./types.ts";

describe("types", () => {
  it("supports a generic EvictionPolicy contract", () => {
    const calls: string[] = [];
    const policy: EvictionPolicy<string> = {
      clear: () => calls.push("clear"),
      evict: () => undefined,
      onDelete: (key) => calls.push(`delete:${key}`),
      onGet: (key) => calls.push(`get:${key}`),
      onSet: (key) => calls.push(`set:${key}`),
    };

    policy.onSet("a");
    policy.onGet("a");
    policy.onDelete("a");
    policy.clear();

    expect(calls).toStrictEqual(["set:a", "get:a", "delete:a", "clear"]);
    expect(policy.evict()).toBeUndefined();
  });

  it("accepts CacheOptions and SetOptions shapes", () => {
    const onEvict = (key: string, value: number): void => {
      expect(key).toBe("a");
      expect(value).toBe(1);
    };
    const options: CacheOptions<string, number> = { onEvict, ttl: 1_000 };
    const setOptions: SetOptions = { ttl: 500 };

    expect(options.ttl).toBe(1_000);
    expect(setOptions.ttl).toBe(500);
    options.onEvict?.("a", 1);
  });
});
