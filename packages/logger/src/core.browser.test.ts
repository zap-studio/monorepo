import { describe, expect, it } from "vitest";

import { isLevelEnabled, LOG_LEVEL_ORDER } from "./core.ts";

describe("core", () => {
  it("orders levels from all to none", () => {
    expect(LOG_LEVEL_ORDER).toStrictEqual([
      "all",
      "trace",
      "debug",
      "info",
      "warn",
      "error",
      "fatal",
      "none",
    ]);
  });

  it("enables a level equal to minLevel", () => {
    expect(isLevelEnabled("info", "info")).toBe(true);
  });

  it("enables a level above minLevel", () => {
    expect(isLevelEnabled("error", "info")).toBe(true);
  });

  it("disables a level below minLevel", () => {
    expect(isLevelEnabled("debug", "info")).toBe(false);
  });

  it("enables everything when minLevel is all", () => {
    expect(isLevelEnabled("trace", "all")).toBe(true);
  });

  it("disables everything when minLevel is none", () => {
    expect(isLevelEnabled("fatal", "none")).toBe(false);
  });
});
