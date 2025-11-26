import { type } from "arktype";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { $fetch, api } from "../src";
import { ValidationError } from "../src/errors";

describe("$fetch with ArkType schemas", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    global.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should validate with ArkType object schema", async () => {
    const schema = type({
      id: "number",
      name: "string",
      email: "string.email",
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

  it("should throw ValidationError on invalid data with ArkType", async () => {
    const schema = type({
      id: "number",
      email: "string.email",
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

  it("should return validation result when throwOnValidationError is false with ArkType", async () => {
    const schema = type({
      id: "number",
      email: "string.email",
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
    // @ts-expect-error - checking for issues
    expect(result.issues).toBeDefined();
    // @ts-expect-error - checking for issues
    expect(Array.isArray(result.issues)).toBe(true);
  });

  it("should return successful validation result when data is valid and throwOnValidationError is false", async () => {
    const schema = type({
      id: "number",
      email: "string.email",
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
    // @ts-expect-error - checking for value
    expect(result.value).toEqual(validData);
    // @ts-expect-error - checking for issues
    expect(result.issues).toBeUndefined();
  });

  it("should work with ArkType array schemas", async () => {
    const schema = type({
      id: "number",
      name: "string",
    }).array();

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

  it("should work with api.get using ArkType", async () => {
    const schema = type({ success: "boolean" });
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

  it("should work with api.post using ArkType", async () => {
    const schema = type({ id: "number", created: "boolean" });
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

  it("should work with ArkType optional fields", async () => {
    const schema = type({
      id: "number",
      name: "string",
      "description?": "string",
    });

    const mockData = { id: 1, name: "Product" };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockData,
    });

    const result = await $fetch("https://api.example.com/product", schema);

    expect(result).toEqual(mockData);
  });

  it("should work with ArkType union types", async () => {
    const schema = type("string|number");
    const mockData = "test-string";

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockData,
    });

    const result = await $fetch("https://api.example.com/value", schema);

    expect(result).toBe(mockData);
  });
});
