import { describe, expect, it } from "vitest";

import { normalizeRequest } from "../src/request.js";

describe(normalizeRequest, () => {
  it("keeps URL strings simple", () => {
    const options = { headers: { A: "1" }, method: "POST" };

    expect(
      normalizeRequest("https://api.example.com/users", options)
    ).toStrictEqual({
      options,
      url: "https://api.example.com/users",
    });
  });

  it("uses an empty options object when none is provided", () => {
    expect(normalizeRequest("/users")).toStrictEqual({
      options: {},
      url: "/users",
    });
  });

  it("serializes URL objects to a string url", () => {
    const input = new URL("/users", "https://api.example.com");
    expect(normalizeRequest(input)).toStrictEqual({
      options: {},
      url: "https://api.example.com/users",
    });
  });

  it("clones Request inputs and exposes their URL", () => {
    const request = new Request("https://api.example.com/users", {
      headers: { A: "1" },
      method: "POST",
    });

    const normalized = normalizeRequest(request);

    expect(normalized.url).toBe("https://api.example.com/users");
    expect(normalized.request).toBeInstanceOf(Request);
    expect(normalized.request).not.toBe(request);
    expect(new Headers(normalized.options.headers).get("A")).toBe("1");
  });

  it("lets options override Request headers while preserving the other Request headers", () => {
    const request = new Request("https://api.example.com/users", {
      headers: { A: "1", B: "2" },
    });

    const normalized = normalizeRequest(request, {
      headers: { B: "20", C: "3" },
      method: "PATCH",
    });
    const headers = new Headers(normalized.options.headers);

    expect(normalized.options.method).toBe("PATCH");
    expect(headers.get("A")).toBe("1");
    expect(headers.get("B")).toBe("20");
    expect(headers.get("C")).toBe("3");
  });
});
