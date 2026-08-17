import { describe, expect, it } from "vitest";

import {
  andThen,
  fromNullable,
  isNone,
  isSome,
  map,
  match,
  none,
  some,
  unwrap,
  unwrapOr,
  unwrapOrElse,
} from "./option.js";
import { pipe } from "./pipe.js";

describe("some/none", () => {
  it("creates a Some value", () => {
    expect(some(42)).toEqual({ some: true, value: 42 });
  });

  it("creates a None value", () => {
    expect(none()).toEqual({ some: false });
  });
});

describe("isSome/isNone", () => {
  it("narrows Some", () => {
    expect(isSome(some(1))).toBe(true);
    expect(isSome(none())).toBe(false);
  });

  it("narrows None", () => {
    expect(isNone(none())).toBe(true);
    expect(isNone(some(1))).toBe(false);
  });
});

describe("map", () => {
  it("transforms Some", () => {
    expect(
      pipe(
        some(2),
        map((n: number) => n * 2)
      )
    ).toEqual(some(4));
  });

  it("passes None through unchanged", () => {
    expect(
      pipe(
        none(),
        map((n: number) => n * 2)
      )
    ).toEqual(none());
  });
});

describe("andThen", () => {
  const half = (n: number) => (n % 2 === 0 ? some(n / 2) : none());

  it("chains on Some", () => {
    expect(pipe(some(4), andThen(half))).toEqual(some(2));
  });

  it("short-circuits on None", () => {
    expect(pipe(none(), andThen(half))).toEqual(none());
  });

  it("can produce None from a Some input", () => {
    expect(pipe(some(3), andThen(half))).toEqual(none());
  });
});

describe("unwrapOr", () => {
  it("returns the Some value", () => {
    expect(pipe(some(1), unwrapOr(0))).toBe(1);
  });

  it("returns the default for None", () => {
    expect(pipe(none(), unwrapOr(0))).toBe(0);
  });
});

describe("unwrapOrElse", () => {
  it("returns the Some value", () => {
    expect(
      pipe(
        some(1),
        unwrapOrElse(() => 0)
      )
    ).toBe(1);
  });

  it("computes a fallback for None", () => {
    expect(
      pipe(
        none(),
        unwrapOrElse(() => 99)
      )
    ).toBe(99);
  });
});

describe("unwrap", () => {
  it("returns the Some value", () => {
    expect(unwrap(some(42))).toBe(42);
  });

  it("throws for None", () => {
    expect(() => unwrap(none())).toThrowError(
      "Called unwrap() on a None value"
    );
  });
});

describe("match", () => {
  it("calls some for Some", () => {
    const result = pipe(
      some(42),
      match({ some: (n: number) => `got ${n}`, none: () => "nothing" })
    );

    expect(result).toBe("got 42");
  });

  it("calls none for None", () => {
    const result = pipe(
      none(),
      match({ some: () => "never", none: () => "nothing" })
    );

    expect(result).toBe("nothing");
  });
});

describe("fromNullable", () => {
  it("returns Some for a present value", () => {
    expect(fromNullable(42)).toEqual(some(42));
  });

  it("returns None for null", () => {
    expect(fromNullable(null)).toEqual(none());
  });

  it("returns None for undefined", () => {
    expect(fromNullable(undefined)).toEqual(none());
  });

  it("returns None for a value not found by Array#find", () => {
    const found = [1, 2, 3].find((n) => n > 5);
    expect(fromNullable(found)).toEqual(none());
  });
});
