import { describe, expect, it } from "vitest";

import { pipe } from "./pipe.js";

describe("pipe", () => {
  it("returns the value unchanged with no functions", () => {
    expect(pipe(5)).toBe(5);
  });

  it("applies a single function", () => {
    expect(pipe(5, (n: number) => n + 1)).toBe(6);
  });

  it("applies functions left to right", () => {
    const result = pipe(
      5,
      (n: number) => n + 1,
      (n: number) => n * 2,
      (n: number) => `${n}`
    );

    expect(result).toBe("12");
  });

  it("supports many chained functions", () => {
    const result = pipe(
      1,
      (n: number) => n + 1,
      (n: number) => n + 1,
      (n: number) => n + 1,
      (n: number) => n + 1,
      (n: number) => n + 1,
      (n: number) => n + 1,
      (n: number) => n + 1,
      (n: number) => n + 1
    );

    expect(result).toBe(9);
  });
});
