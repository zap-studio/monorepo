import { describe, expect, it } from "vitest";

import { createToolRegistry } from "./registry.ts";

describe("createToolRegistry (node/SSR)", () => {
  it("lists tools in insertion order", () => {
    const registry = createToolRegistry();
    registry.add({ name: "a", description: "A", execute: async () => "ok" });
    registry.add({ name: "b", description: "B", execute: async () => "ok" });

    expect(registry.list().map((tool) => tool.name)).toStrictEqual(["a", "b"]);
  });

  it("add returns the registry for chaining", () => {
    const registry = createToolRegistry();
    const chained = registry.add({ name: "a", description: "A", execute: async () => "ok" });

    expect(chained).toBe(registry);
  });

  it("mount resolves with no-op unregister fns when document is undefined", async () => {
    const registry = createToolRegistry();
    registry.add({ name: "a", description: "A", execute: async () => "ok" });

    await expect(registry.mount()).resolves.toBeUndefined();
  });

  it("unmount is a no-op before mount", () => {
    const registry = createToolRegistry();
    expect(() => registry.unmount()).not.toThrow();
  });

  it("unmount is idempotent", async () => {
    const registry = createToolRegistry();
    registry.add({ name: "a", description: "A", execute: async () => "ok" });

    await registry.mount();
    registry.unmount();
    expect(() => registry.unmount()).not.toThrow();
  });
});
