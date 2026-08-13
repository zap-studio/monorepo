import type { StandardSchemaV1 } from "@zap-studio/validation";
import { describe, expect, it, vi } from "vitest";

import { createMethod } from "../src/_core.js";
import type { $Fetch } from "../src/types.js";

const schema = {
  "~standard": {
    validate: (input: unknown) => ({ value: input }),
    vendor: "test",
    version: 1,
  },
} satisfies StandardSchemaV1;

type FetchMock = (...args: unknown[]) => Promise<unknown>;
type MockedFetch = $Fetch & ReturnType<typeof vi.fn<FetchMock>>;

const createFetchMock = (
  implementation: FetchMock = async () => {
    await Promise.resolve();
  }
): MockedFetch => vi.fn<FetchMock>(implementation) as unknown as MockedFetch;

describe(createMethod, () => {
  it("creates a method helper", () => {
    expect(createMethod(createFetchMock(), "GET")).toBeTypeOf("function");
  });

  it("passes input, schema, and method options to the fetch function", async () => {
    const fetchMock = createFetchMock();
    const get = createMethod(fetchMock, "GET");

    await get("/users", schema, { headers: { A: "1" } });
    const call = fetchMock.mock.calls[0];

    expect(call?.[0]).toBe("/users");
    expect(call?.[1]).toBe(schema);
    expect(call?.[2]).toStrictEqual({
      headers: { A: "1" },
      method: "GET",
    });
  });

  it("preserves throwOnValidationError: false for the result-object overload", async () => {
    const fetchMock = createFetchMock();
    const post = createMethod(fetchMock, "POST");

    await post("/users", schema, {
      json: { name: "Zap" },
      throwOnValidationError: false,
    });
    const call = fetchMock.mock.calls[0];

    expect(call?.[2]).toStrictEqual({
      json: { name: "Zap" },
      method: "POST",
      throwOnValidationError: false,
    });
  });

  it("preserves throwOnValidationError: true when explicitly provided", async () => {
    const fetchMock = createFetchMock();
    const put = createMethod(fetchMock, "PUT");

    await put("/users/1", schema, { throwOnValidationError: true });
    const call = fetchMock.mock.calls[0];

    expect(call?.[2]).toStrictEqual({
      method: "PUT",
      throwOnValidationError: true,
    });
  });

  it("supports raw Response calls without a schema", async () => {
    const fetchMock = createFetchMock();
    const del = createMethod(fetchMock, "DELETE");

    await del("/users/1", { headers: { A: "1" } });
    const call = fetchMock.mock.calls[0];

    expect(call?.[0]).toBe("/users/1");
    expect(call?.[1]).toStrictEqual({ headers: { A: "1" }, method: "DELETE" });
  });

  it("lets the helper method win when runtime options contain a method", async () => {
    const fetchMock = createFetchMock();
    const patch = createMethod(fetchMock, "PATCH");

    await patch("/users/1", schema, { method: "POST" } as never);
    const call = fetchMock.mock.calls[0];

    expect(call?.[2]).toMatchObject({ method: "PATCH" });
  });
});
