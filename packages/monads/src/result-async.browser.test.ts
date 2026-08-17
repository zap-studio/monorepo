import { describe, expect, it } from "vitest";

import { fromPromise, ResultAsync } from "./result-async.js";
import { err, isErr, isOk, ok } from "./result.js";

describe("ResultAsync", () => {
  it("is awaitable, resolving to the wrapped Result", async () => {
    const resultAsync = new ResultAsync(Promise.resolve(ok(42)));
    expect(await resultAsync).toEqual(ok(42));
  });

  describe("map", () => {
    it("transforms an eventual Ok", async () => {
      const resultAsync = new ResultAsync(Promise.resolve(ok(2))).map(
        (n) => n * 2
      );

      expect(await resultAsync).toEqual(ok(4));
    });

    it("passes an eventual Err through unchanged", async () => {
      const resultAsync = new ResultAsync<number, string>(
        Promise.resolve(err("bad"))
      ).map((n) => n * 2);

      expect(await resultAsync).toEqual(err("bad"));
    });
  });

  describe("mapErr", () => {
    it("transforms an eventual Err", async () => {
      const resultAsync = new ResultAsync(Promise.resolve(err("bad"))).mapErr(
        (e) => e.toUpperCase()
      );

      expect(await resultAsync).toEqual(err("BAD"));
    });
  });

  describe("andThen", () => {
    it("chains a sync Result-returning function", async () => {
      const resultAsync = new ResultAsync<number, string>(
        Promise.resolve(ok(2))
      ).andThen((n) => (n > 0 ? ok(n * 2) : err("negative")));

      expect(await resultAsync).toEqual(ok(4));
    });

    it("chains a Promise<Result>-returning function", async () => {
      const resultAsync = new ResultAsync<number, string>(
        Promise.resolve(ok(2))
      ).andThen((n) => Promise.resolve(ok(n * 2)));

      expect(await resultAsync).toEqual(ok(4));
    });

    it("chains a ResultAsync-returning function", async () => {
      const resultAsync = new ResultAsync<number, string>(
        Promise.resolve(ok(2))
      ).andThen((n) => new ResultAsync(Promise.resolve(ok(n * 2))));

      expect(await resultAsync).toEqual(ok(4));
    });

    it("short-circuits on an eventual Err", async () => {
      const resultAsync = new ResultAsync<number, string>(
        Promise.resolve(err("bad"))
      ).andThen((n) => ok(n * 2));

      expect(await resultAsync).toEqual(err("bad"));
    });
  });

  describe("match", () => {
    it("resolves the ok branch", async () => {
      const message = await new ResultAsync(Promise.resolve(ok(42))).match({
        ok: (n) => `got ${n}`,
        err: () => "never",
      });

      expect(message).toBe("got 42");
    });

    it("resolves the err branch", async () => {
      const message = await new ResultAsync(Promise.resolve(err("bad"))).match({
        ok: () => "never",
        err: (e) => `failed: ${e}`,
      });

      expect(message).toBe("failed: bad");
    });
  });
});

describe("fromPromise", () => {
  it("wraps a resolved promise in Ok", async () => {
    const result = await fromPromise(Promise.resolve(42), String);
    expect(isOk(result)).toBe(true);
    expect(result).toEqual(ok(42));
  });

  it("wraps a rejected promise in Err via mapError", async () => {
    const result = await fromPromise(
      Promise.reject(new Error("boom")),
      (error) => (error instanceof Error ? error.message : "unknown")
    );

    expect(isErr(result)).toBe(true);
    expect(result).toEqual(err("boom"));
  });
});
