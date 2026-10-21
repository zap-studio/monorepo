/**
 * MRU eviction policy: exact most-recently-used order via a doubly-linked
 * key list.
 *
 * @module @zap-studio/cache/mru
 */

import type { EvictionPolicy } from "./types.ts";

interface Node<K> {
  prev: K | null;
  next: K | null;
}

/**
 * Creates an MRU (most-recently-used) eviction policy.
 *
 * Both `onGet` and `onSet` move the key to the most-recently-used end. A
 * doubly-linked list of keys (backed by a `Map<K, Node<K>>`) gives O(1)
 * touch, O(1) eviction, and exact (not approximate) MRU ordering —
 * `evict()` removes the most-recently-used key instead of the oldest, the
 * inverse of `lru()`.
 *
 * @example
 * ```ts
 * import { createCache } from "@zap-studio/cache";
 * import { mru } from "@zap-studio/cache/mru";
 *
 * const cache = createCache<string, number>(2, { policy: mru() });
 * ```
 */
export const mru = <K>(): EvictionPolicy<K> => {
  const nodes = new Map<K, Node<K>>();
  let tail: K | null = null; // most-recently-used

  const unlink = (node: Node<K>): void => {
    if (node.prev !== null) {
      const prevNode = nodes.get(node.prev);
      // v8 ignore next -- node.prev, when not null, always names a key still in `nodes`: every prev/next link is kept in sync with the map.
      if (prevNode !== undefined) {
        prevNode.next = node.next;
      }
    }

    if (node.next === null) {
      tail = node.prev;
    } else {
      const nextNode = nodes.get(node.next);
      // v8 ignore next -- same invariant as above, for node.next.
      if (nextNode !== undefined) {
        nextNode.prev = node.prev;
      }
    }
  };

  const touch = (key: K): void => {
    const existing = nodes.get(key);
    if (existing !== undefined) {
      unlink(existing);
    }

    const node: Node<K> = { next: null, prev: tail };
    if (tail !== null) {
      const tailNode = nodes.get(tail);
      // v8 ignore next -- tail, when not null, always names a key already in `nodes`.
      if (tailNode !== undefined) {
        tailNode.next = key;
      }
    }
    tail = key;
    nodes.set(key, node);
  };

  return {
    clear(): void {
      nodes.clear();
      tail = null;
    },
    evict(): K | undefined {
      if (tail === null) {
        return undefined;
      }

      const evicted = tail;
      const node = nodes.get(evicted);
      // v8 ignore next -- tail always names a key present in `nodes`, so this is always defined.
      if (node !== undefined) {
        unlink(node);
      }
      nodes.delete(evicted);
      return evicted;
    },
    onDelete(key: K): void {
      const node = nodes.get(key);
      if (node === undefined) {
        return;
      }

      unlink(node);
      nodes.delete(key);
    },
    onGet(key: K): void {
      touch(key);
    },
    onSet(key: K): void {
      touch(key);
    },
  };
};
