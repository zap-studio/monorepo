import { describe, it, expect } from "vitest";
import { isPlainObject } from "../src/utils";

describe("isPlainObject", () => {
  it("returns true for a plain object literal", () => {
    expect(isPlainObject({ a: 1, b: 2 })).toBe(true);
  });

  it("returns true for an object created with Object.create(null)", () => {
    const obj = Object.create(null);
    obj.x = 1;
    expect(isPlainObject(obj)).toBe(true);
  });

  it("returns false for arrays", () => {
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject([1, 2, 3])).toBe(false);
  });

  it("returns false for null", () => {
    expect(isPlainObject(null)).toBe(false);
  });

  it("returns false for Date instances", () => {
    expect(isPlainObject(new Date())).toBe(false);
  });

  it("returns false for functions", () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const fn = () => {
      // empty
    };
    expect(isPlainObject(fn)).toBe(false);
  });

  it("returns false for Map and Set", () => {
    expect(isPlainObject(new Map())).toBe(false);
    expect(isPlainObject(new Set())).toBe(false);
  });

  it("returns false for primitive values", () => {
    expect(isPlainObject(0)).toBe(false);
    expect(isPlainObject("foo")).toBe(false);
    expect(isPlainObject(true)).toBe(false);
    expect(isPlainObject(Symbol("s"))).toBe(false);
    expect(isPlainObject(10n)).toBe(false);
    expect(isPlainObject(undefined)).toBe(false);
  });
});
