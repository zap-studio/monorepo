import { describe, expect, it } from "vitest";

import {
  err,
  fromNullable,
  fromPromise,
  fromThrowable,
  isErr,
  isNone,
  isOk,
  isSome,
  none,
  ok,
  Option,
  pipe,
  Result,
  ResultAsync,
  some,
} from "./index.ts";

describe("root entrypoint", () => {
  it("re-exports Result constructors and guards bare", () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 });
    expect(err("x")).toEqual({ ok: false, error: "x" });
    expect(isOk(ok(1))).toBe(true);
    expect(isErr(err("x"))).toBe(true);
  });

  it("re-exports Option constructors and guards bare", () => {
    expect(some(1)).toEqual({ some: true, value: 1 });
    expect(none()).toEqual({ some: false });
    expect(isSome(some(1))).toBe(true);
    expect(isNone(none())).toBe(true);
  });

  it("re-exports fromThrowable, fromNullable, fromPromise, pipe, ResultAsync", () => {
    expect(typeof fromThrowable).toBe("function");
    expect(typeof fromNullable).toBe("function");
    expect(typeof fromPromise).toBe("function");
    expect(typeof pipe).toBe("function");
    expect(typeof ResultAsync).toBe("function");
  });

  it("groups Result's overlapping combinators under the Result namespace", () => {
    expect(
      pipe(
        ok(2),
        Result.map((n: number) => n * 2),
      ),
    ).toEqual(ok(4));

    expect(
      pipe(
        ok(2),
        Result.andThen((n: number) => ok(n + 1)),
      ),
    ).toEqual(ok(3));
  });

  it("groups Option's overlapping combinators under the Option namespace, distinct from Result's", () => {
    expect(
      pipe(
        some(2),
        Option.map((n: number) => n * 2),
      ),
    ).toEqual(some(4));

    expect(Result.map).not.toBe(Option.map);
  });

  it("exposes orElse under both namespaces, as distinct functions", () => {
    expect(
      pipe(
        err("bad"),
        Result.orElse(() => ok(0)),
      ),
    ).toEqual(ok(0));

    expect(
      pipe(
        none(),
        Option.orElse(() => some(0)),
      ),
    ).toEqual(some(0));

    expect(Result.orElse).not.toBe(Option.orElse);
  });
});
