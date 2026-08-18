import { describe, expect, it } from "vitest";

import { pipe } from "./pipe.ts";
import {
  andThen,
  err,
  fromThrowable,
  isErr,
  isOk,
  map,
  mapErr,
  match,
  ok,
  orElse,
  unwrap,
  unwrapOr,
  unwrapOrElse,
} from "./result.ts";

describe("ok/err", () => {
  it("creates an Ok value", () => {
    expect(ok(42)).toEqual({ ok: true, value: 42 });
  });

  it("creates an Err value", () => {
    expect(err("bad")).toEqual({ ok: false, error: "bad" });
  });
});

describe("isOk/isErr", () => {
  it("narrows Ok", () => {
    expect(isOk(ok(1))).toBe(true);
    expect(isOk(err("x"))).toBe(false);
  });

  it("narrows Err", () => {
    expect(isErr(err("x"))).toBe(true);
    expect(isErr(ok(1))).toBe(false);
  });
});

describe("map", () => {
  it("transforms Ok", () => {
    expect(
      pipe(
        ok(2),
        map((n: number) => n * 2),
      ),
    ).toEqual(ok(4));
  });

  it("passes Err through unchanged", () => {
    const result = err("bad");
    expect(
      pipe(
        result,
        map((n: number) => n * 2),
      ),
    ).toEqual(result);
  });
});

describe("mapErr", () => {
  it("transforms Err", () => {
    expect(
      pipe(
        err("bad"),
        mapErr((e: string) => e.toUpperCase()),
      ),
    ).toEqual(err("BAD"));
  });

  it("passes Ok through unchanged", () => {
    const result = ok(1);
    expect(
      pipe(
        result,
        mapErr((e: string) => e.toUpperCase()),
      ),
    ).toEqual(result);
  });
});

describe("andThen", () => {
  const parse = (s: string) => (Number.isNaN(Number(s)) ? err("not a number") : ok(Number(s)));

  it("chains on Ok", () => {
    expect(pipe(ok("42"), andThen(parse))).toEqual(ok(42));
  });

  it("short-circuits on Err", () => {
    const result = err("upstream failure");
    expect(pipe(result, andThen(parse))).toEqual(result);
  });
});

describe("orElse", () => {
  it("passes an Ok through unchanged, without calling fn", () => {
    let called = false;
    const result = pipe(
      ok(1),
      orElse(() => {
        called = true;
        return ok(0);
      }),
    );

    expect(result).toEqual(ok(1));
    expect(called).toBe(false);
  });

  it("recovers an Err with the fallback Result", () => {
    expect(
      pipe(
        err("bad"),
        orElse((e: string) => ok(e.length)),
      ),
    ).toEqual(ok(3));
  });

  it("can produce Err from an Err input", () => {
    expect(
      pipe(
        err("bad"),
        orElse((e: string) => err(e.toUpperCase())),
      ),
    ).toEqual(err("BAD"));
  });
});

describe("unwrapOr", () => {
  it("returns the Ok value", () => {
    expect(pipe(ok(1), unwrapOr(0))).toBe(1);
  });

  it("returns the default for Err", () => {
    expect(pipe(err("bad"), unwrapOr(0))).toBe(0);
  });
});

describe("unwrapOrElse", () => {
  it("returns the Ok value", () => {
    expect(
      pipe(
        ok(1),
        unwrapOrElse(() => 0),
      ),
    ).toBe(1);
  });

  it("computes a fallback for Err", () => {
    expect(
      pipe(
        err("bad"),
        unwrapOrElse((e: string) => e.length),
      ),
    ).toBe(3);
  });
});

describe("unwrap", () => {
  it("returns the Ok value", () => {
    expect(unwrap(ok(42))).toBe(42);
  });

  it("throws for Err, with the error as cause", () => {
    let caught: unknown;

    try {
      unwrap(err("bad"));
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toBe("Called unwrap() on an Err value");
    expect((caught as Error).cause).toBe("bad");
  });
});

describe("match", () => {
  it("calls ok for Ok", () => {
    const result = pipe(ok(42), match({ ok: (n: number) => `got ${n}`, err: () => "never" }));

    expect(result).toBe("got 42");
  });

  it("calls err for Err", () => {
    const result = pipe(
      err("bad"),
      match({ ok: () => "never", err: (e: string) => `failed: ${e}` }),
    );

    expect(result).toBe("failed: bad");
  });
});

describe("fromThrowable", () => {
  it("returns Ok when the function does not throw", () => {
    const safeParse = fromThrowable(JSON.parse);
    expect(safeParse('{"a":1}')).toEqual(ok({ a: 1 }));
  });

  it("returns Err with the mapped error when the function throws", () => {
    const safeParse = fromThrowable(JSON.parse, (error) =>
      error instanceof Error ? error.message : "parse failed",
    );

    const result = safeParse("not json");
    expect(isErr(result)).toBe(true);
  });

  it("returns Err with the raw caught value when mapError is omitted", () => {
    const throwing = fromThrowable((): never => {
      throw "boom";
    });

    expect(throwing()).toEqual(err("boom"));
  });
});
