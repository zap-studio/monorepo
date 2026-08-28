import { describe, expect, it } from "vitest";

import type { Logger, LogLevel } from "./types.ts";

describe("types", () => {
  it("supports a Logger implementation exercising every method", () => {
    const calls: {
      level: string;
      message: string;
      context: Record<string, unknown> | null;
    }[] = [];

    const logger: Logger = {
      trace: (message, context) =>
        calls.push({ context: context ?? null, level: "trace", message }),
      debug: (message, context) =>
        calls.push({ context: context ?? null, level: "debug", message }),
      info: (message, context) => calls.push({ context: context ?? null, level: "info", message }),
      warn: (message, context) => calls.push({ context: context ?? null, level: "warn", message }),
      error: (message, context) =>
        calls.push({ context: context ?? null, level: "error", message }),
      fatal: (message, context) =>
        calls.push({ context: context ?? null, level: "fatal", message }),
    };

    logger.trace("t");
    logger.debug("d", { id: 1 });
    logger.info("i");
    logger.warn("w", { retry: true });
    logger.error("e");
    logger.fatal("f", { fatal: true });

    expect(calls).toStrictEqual([
      { context: null, level: "trace", message: "t" },
      { context: { id: 1 }, level: "debug", message: "d" },
      { context: null, level: "info", message: "i" },
      { context: { retry: true }, level: "warn", message: "w" },
      { context: null, level: "error", message: "e" },
      { context: { fatal: true }, level: "fatal", message: "f" },
    ]);
  });

  it("accepts every LogLevel value, including all/none boundaries", () => {
    const levels: LogLevel[] = ["all", "trace", "debug", "info", "warn", "error", "fatal", "none"];

    expect(levels).toHaveLength(8);
  });
});
