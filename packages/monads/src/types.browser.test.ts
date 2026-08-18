import { describe, expect, it } from "vitest";

import type {
  Err,
  None,
  Ok,
  Option,
  OptionMatchers,
  Result,
  ResultMatchers,
  Some,
} from "./types.ts";

describe("types", () => {
  it("supports the Ok/Err/Result shapes", () => {
    const okValue: Ok<number> = { ok: true, value: 42 };
    const errValue: Err<string> = { error: "bad", ok: false };
    const result: Result<number, string> = okValue;

    expect(okValue).toStrictEqual({ ok: true, value: 42 });
    expect(errValue).toStrictEqual({ error: "bad", ok: false });
    expect(result).toStrictEqual(okValue);
  });

  it("supports ResultMatchers", () => {
    const matchers: ResultMatchers<number, string, string> = {
      err: (error) => `failed: ${error}`,
      ok: (value) => `got ${value}`,
    };

    expect(matchers.ok(1)).toBe("got 1");
    expect(matchers.err("bad")).toBe("failed: bad");
  });

  it("supports the Some/None/Option shapes", () => {
    const someValue: Some<number> = { some: true, value: 42 };
    const noneValue: None = { some: false };
    const option: Option<number> = someValue;

    expect(someValue).toStrictEqual({ some: true, value: 42 });
    expect(noneValue).toStrictEqual({ some: false });
    expect(option).toStrictEqual(someValue);
  });

  it("supports OptionMatchers", () => {
    const matchers: OptionMatchers<number, string> = {
      none: () => "nothing",
      some: (value) => `got ${value}`,
    };

    expect(matchers.some(1)).toBe("got 1");
    expect(matchers.none()).toBe("nothing");
  });
});
