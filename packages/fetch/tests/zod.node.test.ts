import { isStandardSchema } from "@zap-studio/validation";
import { ValidationError } from "@zap-studio/validation/errors";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { $fetch, api } from "../src/index.js";

describe("Zod Standard Schema compatibility", () => {
  it("should expose ~standard property", () => {
    const schema = z.object({ id: z.number() });
    expect("~standard" in schema).toBeTruthy();
    expect(schema["~standard"]).toBeDefined();
  });

  it("should be recognized by isStandardSchema", () => {
    const schema = z.object({ id: z.number() });
    expect(isStandardSchema(schema)).toBeTruthy();
  });
});

describe("$fetch with Zod schemas", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should validate with Zod object schema", async () => {
    const schema = z.object({
      email: z.email(),
      id: z.number(),
      name: z.string(),
    });

    const mockData = { email: "test@example.com", id: 1, name: "Test User" };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/user", schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should throw ValidationError on invalid data with Zod", async () => {
    const schema = z.object({
      email: z.email(),
      id: z.number(),
    });

    const invalidData = { email: "not-an-email", id: 1 };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => invalidData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    await expect(
      $fetch("https://api.example.com/user", schema)
    ).rejects.toThrow(ValidationError);
  });

  it("should return validation result when throwOnValidationError is false with Zod", async () => {
    const schema = z.object({
      email: z.email(),
      id: z.number(),
    });

    const invalidData = { email: "not-an-email", id: 1 };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => invalidData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/user", schema, {
      throwOnValidationError: false,
    });

    expect(result).toHaveProperty("issues");
    expect(Array.isArray((result as { issues?: unknown }).issues)).toBeTruthy();
  });

  it("should return successful validation result when data is valid and throwOnValidationError is false", async () => {
    const schema = z.object({
      email: z.email(),
      id: z.number(),
    });

    const validData = { email: "test@example.com", id: 1 };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => validData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/user", schema, {
      throwOnValidationError: false,
    });

    expect(result).toHaveProperty("value");
    expect((result as { value?: unknown }).value).toStrictEqual(validData);
    expect((result as { issues?: unknown }).issues).toBeUndefined();
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
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await $fetch("https://api.example.com/users", schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should work with api.get using Zod", async () => {
    const schema = z.object({ success: z.boolean() });
    const mockData = { success: true };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 200,
      statusText: "OK",
    });

    const result = await api.get("https://api.example.com/status", schema);

    expect(result).toStrictEqual(mockData);
  });

  it("should work with api.post using Zod", async () => {
    const schema = z.object({ created: z.boolean(), id: z.number() });
    const mockData = { created: true, id: 123 };
    const body = { name: "New Item" };

    fetchMock.mockResolvedValue({
      headers: new Headers({ "content-type": "application/json" }),
      json: () => mockData,
      ok: true,
      status: 201,
      statusText: "Created",
    });

    const result = await api.post("https://api.example.com/items", schema, {
      body: JSON.stringify(body),
    });

    expect(result).toStrictEqual(mockData);
  });
});
