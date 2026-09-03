import { describe, expect, it } from "vitest";

import { defineTool, hasWebMCPSupport, registerTool } from "./register.ts";

describe("hasWebMCPSupport (node/SSR)", () => {
  it("returns false when document is undefined", () => {
    expect(hasWebMCPSupport()).toBe(false);
  });
});

describe("registerTool (node/SSR)", () => {
  it("resolves to a no-op unregister function when document is undefined", async () => {
    const unregister = await registerTool({
      name: "ssr_tool",
      description: "A tool registered during SSR",
      execute: async () => "ok",
    });

    expect(typeof unregister).toBe("function");
    expect(() => unregister()).not.toThrow();
  });
});

describe("defineTool (node)", () => {
  it("returns a valid tool unchanged", () => {
    const tool = defineTool({
      name: "valid_tool",
      description: "A valid tool",
      execute: async () => "ok",
    });

    expect(tool.name).toBe("valid_tool");
  });

  it("accepts names using letters, digits, underscores, hyphens, and dots", () => {
    expect(() =>
      defineTool({ name: "posts.like-v2_1", description: "desc", execute: async () => "ok" }),
    ).not.toThrow();
  });

  it("throws TypeError for an empty name", () => {
    expect(() => defineTool({ name: "", description: "desc", execute: async () => "ok" })).toThrow(
      TypeError,
    );
  });

  it("throws TypeError for a name with disallowed characters", () => {
    expect(() =>
      defineTool({ name: "invalid name!", description: "desc", execute: async () => "ok" }),
    ).toThrow(TypeError);
  });

  it("throws TypeError for a name longer than 128 characters", () => {
    expect(() =>
      defineTool({ name: "a".repeat(129), description: "desc", execute: async () => "ok" }),
    ).toThrow(TypeError);
  });

  it("throws TypeError for an empty description", () => {
    expect(() =>
      defineTool({ name: "valid_name", description: "", execute: async () => "ok" }),
    ).toThrow(TypeError);
  });

  it("throws TypeError for a whitespace-only description", () => {
    expect(() =>
      defineTool({ name: "valid_name", description: "   ", execute: async () => "ok" }),
    ).toThrow(TypeError);
  });
});
