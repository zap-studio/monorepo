import { describe, expect, it } from "vitest";

import { applyJitter } from "./jitter.ts";

describe(applyJitter, () => {
  it("returns delayMs unchanged when jitter is omitted", () => {
    expect(applyJitter(1000)).toBe(1000);
  });

  it("applies full jitter across [0, delayMs]", () => {
    expect(applyJitter(1000, { mode: "full", random: () => 0 })).toBe(0);
    expect(applyJitter(1000, { mode: "full", random: () => 0.5 })).toBe(500);
    expect(applyJitter(1000, { mode: "full", random: () => 0.999 })).toBe(999);
  });

  it("applies equal jitter across [delayMs/2, delayMs]", () => {
    expect(applyJitter(1000, { mode: "equal", random: () => 0 })).toBe(500);
    expect(applyJitter(1000, { mode: "equal", random: () => 0.5 })).toBe(750);
    expect(applyJitter(1000, { mode: "equal", random: () => 0.999 })).toBe(1000);
  });

  it("accepts a jitter mode string shorthand with Math.random", () => {
    const result = applyJitter(1000, "full");
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1000);
  });
});
