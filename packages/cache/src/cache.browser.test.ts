import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { EvictionPolicy } from "./types.ts";

import { createCache } from "./cache.ts";
import { fifo } from "./fifo.ts";

describe("createCache", () => {
  describe("get/set/has", () => {
    it("returns undefined for a missing key", () => {
      const cache = createCache<string, number>(2);

      expect(cache.get("a")).toBeUndefined();
    });

    it("returns the value set for a key", () => {
      const cache = createCache<string, number>(2);

      cache.set("a", 1);

      expect(cache.get("a")).toBe(1);
    });

    it("has returns true for a present key and false for a missing key", () => {
      const cache = createCache<string, number>(2);

      cache.set("a", 1);

      expect(cache.has("a")).toBe(true);
      expect(cache.has("b")).toBe(false);
    });
  });

  describe("capacity and eviction", () => {
    it("uses lru by default: evicts the least recently used key when full", () => {
      const cache = createCache<string, number>(2);

      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);

      expect(cache.has("a")).toBe(false);
      expect(cache.has("b")).toBe(true);
      expect(cache.has("c")).toBe(true);
    });

    it("does not evict when updating an existing key at capacity", () => {
      const cache = createCache<string, number>(2);

      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("a", 10);

      expect(cache.size).toBe(2);
      expect(cache.get("a")).toBe(10);
      expect(cache.has("b")).toBe(true);
    });

    it("calls onEvict with the evicted key and value on capacity eviction", () => {
      const onEvict = vi.fn();
      const cache = createCache<string, number>(1, { onEvict });

      cache.set("a", 1);
      cache.set("b", 2);

      expect(onEvict).toHaveBeenCalledExactlyOnceWith("a", 1);
    });

    it("supports a custom eviction policy", () => {
      const cache = createCache<string, number>(2, { policy: fifo() });

      cache.set("a", 1);
      cache.set("b", 2);
      cache.get("a"); // fifo ignores access, so this must not save "a"
      cache.set("c", 3);

      expect(cache.has("a")).toBe(false);
      expect(cache.has("b")).toBe(true);
      expect(cache.has("c")).toBe(true);
    });

    it("throws RangeError for non-positive capacity", () => {
      expect(() => createCache<string, number>(0)).toThrow(RangeError);
      expect(() => createCache<string, number>(-1)).toThrow(RangeError);
    });

    it("throws RangeError for non-integer capacity", () => {
      expect(() => createCache<string, number>(1.5)).toThrow(RangeError);
    });

    it("does not remove any entry when the policy has nothing to evict", () => {
      const policy: EvictionPolicy<string> = {
        clear: vi.fn(),
        evict: () => undefined,
        onDelete: vi.fn(),
        onGet: vi.fn(),
        onSet: vi.fn(),
      };
      const onEvict = vi.fn();
      const cache = createCache<string, number>(1, { onEvict, policy });

      cache.set("a", 1);
      cache.set("b", 2);

      expect(cache.size).toBe(2);
      expect(onEvict).not.toHaveBeenCalled();
    });

    it("does not call onEvict when the policy returns a key absent from the store", () => {
      const policy: EvictionPolicy<string> = {
        clear: vi.fn(),
        evict: () => "ghost",
        onDelete: vi.fn(),
        onGet: vi.fn(),
        onSet: vi.fn(),
      };
      const onEvict = vi.fn();
      const cache = createCache<string, number>(1, { onEvict, policy });

      cache.set("a", 1);
      cache.set("b", 2);

      expect(cache.size).toBe(2);
      expect(onEvict).not.toHaveBeenCalled();
    });
  });

  describe("peek", () => {
    it("returns the value without bumping the eviction policy", () => {
      const cache = createCache<string, number>(2);

      cache.set("a", 1);
      cache.set("b", 2);
      cache.peek("a"); // must not save "a" from lru eviction
      cache.set("c", 3);

      expect(cache.has("a")).toBe(false);
      expect(cache.has("b")).toBe(true);
      expect(cache.has("c")).toBe(true);
    });

    it("returns undefined for a missing key", () => {
      const cache = createCache<string, number>(2);

      expect(cache.peek("a")).toBeUndefined();
    });

    it("returns undefined and calls onEvict for an expired entry", () => {
      vi.useFakeTimers();
      const onEvict = vi.fn();
      const cache = createCache<string, number>(2, { onEvict, ttl: 100 });
      cache.set("a", 1);

      vi.advanceTimersByTime(101);

      expect(cache.peek("a")).toBeUndefined();
      expect(onEvict).toHaveBeenCalledExactlyOnceWith("a", 1);
      vi.useRealTimers();
    });
  });

  describe("delete", () => {
    it("removes an entry and returns true", () => {
      const cache = createCache<string, number>(2);
      cache.set("a", 1);

      expect(cache.delete("a")).toBe(true);
      expect(cache.has("a")).toBe(false);
    });

    it("returns false when deleting a missing key", () => {
      const cache = createCache<string, number>(2);

      expect(cache.delete("a")).toBe(false);
    });

    it("does not call onEvict for a manual delete", () => {
      const onEvict = vi.fn();
      const cache = createCache<string, number>(2, { onEvict });
      cache.set("a", 1);

      cache.delete("a");

      expect(onEvict).not.toHaveBeenCalled();
    });
  });

  describe("clear", () => {
    it("removes all entries", () => {
      const cache = createCache<string, number>(2);
      cache.set("a", 1);
      cache.set("b", 2);

      cache.clear();

      expect(cache.size).toBe(0);
      expect(cache.has("a")).toBe(false);
      expect(cache.has("b")).toBe(false);
    });

    it("does not call onEvict per entry on clear", () => {
      const onEvict = vi.fn();
      const cache = createCache<string, number>(2, { onEvict });
      cache.set("a", 1);
      cache.set("b", 2);

      cache.clear();

      expect(onEvict).not.toHaveBeenCalled();
    });
  });

  describe("ttl", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("expires an entry after the cache-wide ttl elapses", () => {
      const cache = createCache<string, number>(2, { ttl: 1_000 });
      cache.set("a", 1);

      vi.advanceTimersByTime(1_001);

      expect(cache.get("a")).toBeUndefined();
      expect(cache.has("a")).toBe(false);
    });

    it("expires an entry after a per-entry ttl override", () => {
      const cache = createCache<string, number>(2, { ttl: 10_000 });
      cache.set("a", 1, { ttl: 500 });

      vi.advanceTimersByTime(501);

      expect(cache.get("a")).toBeUndefined();
    });

    it("never expires an entry when no ttl is set", () => {
      const cache = createCache<string, number>(2);
      cache.set("a", 1);

      vi.advanceTimersByTime(1_000 * 60 * 60 * 24 * 365);

      expect(cache.get("a")).toBe(1);
    });

    it("calls onEvict when a get finds an expired entry", () => {
      const onEvict = vi.fn();
      const cache = createCache<string, number>(2, { onEvict, ttl: 100 });
      cache.set("a", 1);

      vi.advanceTimersByTime(101);
      cache.get("a");

      expect(onEvict).toHaveBeenCalledExactlyOnceWith("a", 1);
    });

    it("has returns false for an expired entry", () => {
      const cache = createCache<string, number>(2, { ttl: 100 });
      cache.set("a", 1);

      vi.advanceTimersByTime(101);

      expect(cache.has("a")).toBe(false);
    });
  });

  describe("size/capacity", () => {
    it("reports live entry count via size", () => {
      const cache = createCache<string, number>(3);
      cache.set("a", 1);
      cache.set("b", 2);

      expect(cache.size).toBe(2);
    });

    it("reports the configured capacity", () => {
      const cache = createCache<string, number>(3);

      expect(cache.capacity).toBe(3);
    });
  });

  describe("iteration", () => {
    it("iterates live entries via keys/values/entries/Symbol.iterator", () => {
      const cache = createCache<string, number>(3);
      cache.set("a", 1);
      cache.set("b", 2);

      expect([...cache.keys()]).toStrictEqual(["a", "b"]);
      expect([...cache.values()]).toStrictEqual([1, 2]);
      expect([...cache.entries()]).toStrictEqual([
        ["a", 1],
        ["b", 2],
      ]);
      expect([...cache]).toStrictEqual([
        ["a", 1],
        ["b", 2],
      ]);
    });

    it("skips expired entries during iteration", () => {
      vi.useFakeTimers();
      const cache = createCache<string, number>(3);
      cache.set("a", 1, { ttl: 100 });
      cache.set("b", 2);

      vi.advanceTimersByTime(101);

      expect([...cache.keys()]).toStrictEqual(["b"]);
      expect([...cache.entries()]).toStrictEqual([["b", 2]]);
      expect([...cache.values()]).toStrictEqual([2]);
      vi.useRealTimers();
    });
  });

  describe("EvictionPolicy contract usage", () => {
    it("calls onGet on the configured policy for a live hit", () => {
      const onGet = vi.fn();
      const policy: EvictionPolicy<string> = {
        clear: vi.fn(),
        evict: () => undefined,
        onDelete: vi.fn(),
        onGet,
        onSet: vi.fn(),
      };
      const cache = createCache<string, number>(2, { policy });
      cache.set("a", 1);

      cache.get("a");

      expect(onGet).toHaveBeenCalledExactlyOnceWith("a");
    });

    it("does not call onGet for peek", () => {
      const onGet = vi.fn();
      const policy: EvictionPolicy<string> = {
        clear: vi.fn(),
        evict: () => undefined,
        onDelete: vi.fn(),
        onGet,
        onSet: vi.fn(),
      };
      const cache = createCache<string, number>(2, { policy });
      cache.set("a", 1);

      cache.peek("a");

      expect(onGet).not.toHaveBeenCalled();
    });
  });
});
