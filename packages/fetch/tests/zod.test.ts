import { isStandardSchema } from "@zap-studio/validation";
import { ValidationError } from "@zap-studio/validation/errors";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { $fetch, api } from "../src";

describe("Zod Standard Schema compatibility", () => {
  it("should expose ~standard property", () => {
    const schema = z.object({ id: z.number() });
    expect("~standard" in schema).toBe(true);
    expect(schema["~standard"]).toBeDefined();
  });

  it("should be recognized by isStandardSchema", () => {
    const schema = z.object({ id: z.number() });
    expect(isStandardSchema(schema)).toBe(true);
  });
});

describe("$fetch with Zod schemas", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    global.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should validate with Zod object schema", async () => {
    const schema = z.object({
      id: z.number(),
      name: z.string(),
      email: z.email(),
    });

    const mockData = { id: 1, name: "Test User", email: "test@example.com" };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockData,
    });

    const result = await $fetch("https://api.example.com/user", schema);

    expect(result).toEqual(mockData);
  });

  it("should throw ValidationError on invalid data with Zod", async () => {
    const schema = z.object({
      id: z.number(),
      email: z.email(),
    });

    const invalidData = { id: 1, email: "not-an-email" };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => invalidData,
    });

    await expect(
      $fetch("https://api.example.com/user", schema)
    ).rejects.toThrow(ValidationError);
  });

  it("should return validation result when throwOnValidationError is false with Zod", async () => {
    const schema = z.object({
      id: z.number(),
      email: z.email(),
    });

    const invalidData = { id: 1, email: "not-an-email" };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => invalidData,
    });

    const result = await $fetch("https://api.example.com/user", schema, {
      throwOnValidationError: false,
    });

    expect(result).toHaveProperty("issues");
    if ("issues" in result) {
      expect(result.issues).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
    }
  });

  it("should return successful validation result when data is valid and throwOnValidationError is false", async () => {
    const schema = z.object({
      id: z.number(),
      email: z.email(),
    });

    const validData = { id: 1, email: "test@example.com" };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => validData,
    });

    const result = await $fetch("https://api.example.com/user", schema, {
      throwOnValidationError: false,
    });

    expect(result).toHaveProperty("value");
    if ("value" in result) {
      expect(result.value).toEqual(validData);
      expect(result.issues).toBeUndefined();
    }
  });

  it("should work with Zod array schemas", async () => {
    const schema = z.array(
      z.object({
        id: z.number(),
        name: z.string(),
      })
    );

    const mockData = [
      { id: 1, name: "User 1" },
      { id: 2, name: "User 2" },
    ];

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockData,
    });

    const result = await $fetch("https://api.example.com/users", schema);

    expect(result).toEqual(mockData);
  });

  it("should work with api.get using Zod", async () => {
    const schema = z.object({ success: z.boolean() });
    const mockData = { success: true };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockData,
    });

    const result = await api.get("https://api.example.com/status", schema);

    expect(result).toEqual(mockData);
  });

  it("should work with api.post using Zod", async () => {
    const schema = z.object({ id: z.number(), created: z.boolean() });
    const mockData = { id: 123, created: true };
    const body = { name: "New Item" };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      statusText: "Created",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockData,
    });

    const result = await api.post("https://api.example.com/items", schema, {
      body: JSON.stringify(body),
    });

    expect(result).toEqual(mockData);
  });
});
